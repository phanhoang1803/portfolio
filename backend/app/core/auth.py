# # backend/app/core/auth.py
# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from jose import JWTError, jwt
# from pymongo.database import Database
# from typing import Optional
# from bson import ObjectId

# from ..config import settings
# from ..models.user import User
# from ..schemas.auth import TokenData
# from ..dependencies import get_database

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")

# async def get_current_user(
#     db: Database = Depends(get_database), token: str = Depends(oauth2_scheme)
# ) -> User:
#     """
#     Validate access token and return current user.
    
#     Args:
#         db: MongoDB database instance
#         token: JWT token

#     Returns:
#         User model

#     Raises:
#         HTTPException: If token is invalid or user not found
#     """
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
    
#     try:
#         payload = jwt.decode(
#             token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
#         )
#         user_id: str = payload.get("sub")
#         if user_id is None:
#             raise credentials_exception
#         token_data = TokenData(user_id=user_id)
#     except JWTError:
#         raise credentials_exception
    
#     user = await db.users.find_one({"_id": ObjectId(token_data.user_id)})
#     if user is None:
#         raise credentials_exception
    
#     return User(**user)

# async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
#     """
#     Check if current user is an admin.
    
#     Args:
#         current_user: Current authenticated user

#     Returns:
#         User model if user is admin

#     Raises:
#         HTTPException: If user is not an admin
#     """
#     if not current_user.is_admin:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="The user doesn't have enough privileges",
#         )
#     return current_user


from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.security.utils import get_authorization_scheme_param
from jose import JWTError, jwt
from pymongo.database import Database
from typing import Optional
from bson import ObjectId
from starlette.requests import Request

from ..config import settings
from ..models.user import User
from ..schemas.auth import TokenData
from ..dependencies import get_database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")

# Create an optional OAuth2 scheme that doesn't require authentication
class OAuth2PasswordBearerOptional(OAuth2PasswordBearer):
    """
    OAuth2 scheme that makes authentication optional
    """
    async def __call__(self, request: Request) -> Optional[str]:
        authorization = request.headers.get("Authorization")
        
        if not authorization:
            return None
            
        scheme, param = get_authorization_scheme_param(authorization)
        if scheme.lower() != "bearer":
            return None
            
        return param

# Create an instance of the optional OAuth2 scheme
oauth2_scheme_optional = OAuth2PasswordBearerOptional(tokenUrl=f"{settings.API_PREFIX}/auth/login")

async def get_current_user(
    db: Database = Depends(get_database), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Validate access token and return current user.
    
    Args:
        db: MongoDB database instance
        token: JWT token

    Returns:
        User model

    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"_id": ObjectId(token_data.user_id)})
    if user is None:
        raise credentials_exception
    
    return User(**user)

async def get_optional_current_user(
    db: Database = Depends(get_database), token: str = Depends(oauth2_scheme_optional)
) -> Optional[User]:
    """
    Similar to get_current_user but doesn't raise HTTPException when no token is provided.
    Returns None instead when user is not authenticated.
    
    Args:
        db: MongoDB database instance
        token: Optional JWT token

    Returns:
        User model if authenticated, None otherwise
    """
    if not token:
        return None
        
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        token_data = TokenData(user_id=user_id)
    except JWTError:
        return None
    
    user = await db.users.find_one({"_id": ObjectId(token_data.user_id)})
    if user is None:
        return None
    
    return User(**user)

async def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Check if current user is an admin.
    
    Args:
        current_user: Current authenticated user

    Returns:
        User model if user is admin

    Raises:
        HTTPException: If user is not an admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user