# backend/app/api/endpoints/posts.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from pymongo.database import Database
from bson import ObjectId
import slugify
import os
import shutil
from datetime import datetime

from ...models.user import User
from ...models.post import Post
from ...schemas.post import PostCreate, PostUpdate, PostResponse, PostList
from ...core.auth import get_current_admin, get_current_user, get_optional_current_user
from ...dependencies import get_database
from ...config import settings

router = APIRouter()

@router.get("/", response_model=PostList)
async def list_posts(
    db: Database = Depends(get_database),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    tag: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    List all published posts with pagination.
    If authenticated as admin, show all posts including unpublished ones.
    """
    skip = (page - 1) * page_size
    
    # Build the filter
    filter_query = {}
    
    # Only show published posts unless the user is an admin
    if not current_user or not current_user.is_admin:
        filter_query["is_published"] = True
    
    # Filter by tag if provided
    if tag:
        filter_query["tags"] = tag
    
    # Add search if provided
    if search:
        filter_query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}},
            {"summary": {"$regex": search, "$options": "i"}},
        ]
    
    # Get total count
    total = await db.posts.count_documents(filter_query)
    
    # Get paginated posts
    cursor = db.posts.find(filter_query).sort("created_at", -1).skip(skip).limit(page_size)
    posts = [Post(**post) for post in await cursor.to_list(length=page_size)]
    
    # Calculate total pages
    pages = (total + page_size - 1) // page_size
    
    return PostList(
        posts=posts,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )

@router.get("/{slug}", response_model=PostResponse)
async def get_post(
    slug: str,
    db: Database = Depends(get_database),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Get a post by slug.
    If not published, only the admin can view it.
    """
    post = await db.posts.find_one({"slug": slug})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post_obj = Post(**post)
    
    # Check if post is published or user is admin
    if not post_obj.is_published and (not current_user or not current_user.is_admin):
        raise HTTPException(status_code=404, detail="Post not found")
    
    return post_obj

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post: PostCreate,
    db: Database = Depends(get_database),
    current_user: User = Depends(get_current_admin),
):
    """
    Create a new post (admin only).
    """
    # Generate slug from title if not provided
    if not post.slug:
        post.slug = slugify.slugify(post.title)
    
    # Check if slug already exists
    existing = await db.posts.find_one({"slug": post.slug})
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Post with slug '{post.slug}' already exists",
        )
    
    # Create new post
    new_post = Post(
        **post.dict(),
        author_id=ObjectId(current_user.id),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    # Insert into database
    result = await db.posts.insert_one(new_post.dict(by_alias=True))
    
    # Get the created post
    created_post = await db.posts.find_one({"_id": result.inserted_id})
    
    return Post(**created_post)

@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    post_update: PostUpdate,
    db: Database = Depends(get_database),
    current_user: User = Depends(get_current_admin),
):
    """
    Update an existing post (admin only).
    """
    # Check if post exists
    existing = await db.posts.find_one({"_id": ObjectId(post_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Update fields
    update_data = post_update.dict(exclude_unset=True)
    
    # If slug is being updated, check if the new slug already exists
    if "slug" in update_data and update_data["slug"]:
        slug_exists = await db.posts.find_one({
            "slug": update_data["slug"],
            "_id": {"$ne": ObjectId(post_id)}
        })
        if slug_exists:
            raise HTTPException(
                status_code=400,
                detail=f"Post with slug '{update_data['slug']}' already exists",
            )
    
    # Add updated_at timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update in database
    await db.posts.update_one(
        {"_id": ObjectId(post_id)}, {"$set": update_data}
    )
    
    # Get the updated post
    updated_post = await db.posts.find_one({"_id": ObjectId(post_id)})
    
    return Post(**updated_post)

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    db: Database = Depends(get_database),
    current_user: User = Depends(get_current_admin),
):
    """
    Delete a post (admin only).
    """
    # Check if post exists
    existing = await db.posts.find_one({"_id": ObjectId(post_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Delete from database
    await db.posts.delete_one({"_id": ObjectId(post_id)})
    
    return None

@router.post("/upload-image", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
):
    """
    Upload an image for a post (admin only).
    """
    # Validate file extension
    extension = file.filename.split(".")[-1].lower()
    if extension not in settings.ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension not allowed. Allowed extensions: {settings.ALLOWED_UPLOAD_EXTENSIONS}",
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(settings.MEDIA_ROOT, "images")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the URL
    return {"url": f"/media/images/{filename}"}