# backend/app/api/endpoints/auth.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pymongo.database import Database
from bson import ObjectId

from ...models.user import User
from ...schemas.auth import Token, LoginRequest
from ...schemas.user import UserCreate, UserResponse
from ...core.security import create_access_token, get_password_hash, verify_password
from ...core.auth import get_current_user, get_current_admin
from ...dependencies import get_database
from ...config import settings

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Database = Depends(get_database),
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    # Try to find user by username
    user = await db.users.find_one({"username": form_data.username})
    
    # If not found, try by email
    if not user:
        user = await db.users.find_one({"email": form_data.username})
    
    # If still not found or password doesn't match, raise error
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user["_id"]), expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/json", response_model=Token)
async def login_json(
    login_data: LoginRequest,
    db: Database = Depends(get_database),
):
    """
    JSON login endpoint, alternative to the OAuth2 compatible endpoint.
    """
    # Try to find user by username
    user = await db.users.find_one({"username": login_data.username})
    
    # If not found, try by email
    if not user:
        user = await db.users.find_one({"email": login_data.username})
    
    # If still not found or password doesn't match, raise error
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user["_id"]), expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Database = Depends(get_database),
):
    """
    Register a new user.
    Note: In a real-world application, you might want to restrict registration 
    and only allow admin to create users, or implement email verification.
    """
    # Check if username already exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    # Check if email already exists
    existing_email = await db.users.find_one({"email": user_data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create user with hashed password
    user_dict = user_data.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    
    # Set first user as admin if no users exist
    count = await db.users.count_documents({})
    if count == 0:
        user_dict["is_admin"] = True
    else:
        user_dict["is_admin"] = False
    
    # Insert user into database
    result = await db.users.insert_one(user_dict)
    
    # Get the created user
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    return User(**created_user)

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Get current user information.
    """
    return current_user

@router.post("/init-admin", status_code=status.HTTP_201_CREATED)
async def init_admin(
    db: Database = Depends(get_database),
):
    """
    Initialize the admin user if no users exist.
    This is useful for setting up the application for the first time.
    """
    # Check if any user exists
    count = await db.users.count_documents({})
    if count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Users already exist, cannot initialize admin",
        )
    
    # Create admin user
    admin_user = {
        "username": settings.ADMIN_USERNAME,
        "email": settings.ADMIN_EMAIL,
        "hashed_password": get_password_hash(settings.ADMIN_PASSWORD),
        "is_admin": True,
        "full_name": "Admin User",
    }
    
    # Insert admin user into database
    result = await db.users.insert_one(admin_user)
    
    # Get the created user
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    return {"message": "Admin user created successfully"}