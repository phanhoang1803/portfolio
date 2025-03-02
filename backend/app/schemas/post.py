# backend/app/schemas/post.py
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId

class PostBase(BaseModel):
    title: str
    content: str
    summary: Optional[str] = None
    tags: List[str] = []
    featured_image: Optional[str] = None
    is_published: bool = False

class PostCreate(PostBase):
    slug: Optional[str] = None  # Will be generated from title if not provided

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None
    featured_image: Optional[str] = None
    is_published: Optional[bool] = None
    slug: Optional[str] = None

class PostInDB(PostBase):
    id: str = Field(..., alias="_id")
    author_id: str
    slug: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        from_attributes = True

class PostResponse(PostInDB):
    @field_validator('id', "author_id", mode='before')
    @classmethod
    def convert_objectid_to_str(cls, v: Any) -> str:
        """
        Convert MongoDB ObjectId to string if needed.
        
        Args:
            v: The input value (could be ObjectId or str)
        
        Returns:
            str: String representation of the id
        """
        if isinstance(v, ObjectId):
            return str(v)
        return v
    
    pass

class PostList(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    page_size: int
    pages: int