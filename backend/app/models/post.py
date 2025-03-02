# backend/app/models/post.py
from datetime import datetime
from typing import List, Optional
from pydantic import Field
from bson import ObjectId
from .base import PyObjectId, MongoBaseModel

class Post(MongoBaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str
    content: str
    summary: Optional[str] = None
    slug: str
    author_id: PyObjectId
    tags: List[str] = []
    featured_image: Optional[str] = None
    is_published: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        collection = "posts"
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "title": "Understanding Fourier Transforms",
                "content": "# Fourier Transforms\n\nIn mathematics, a Fourier transform...",
                "summary": "An introduction to Fourier transforms and their applications",
                "slug": "understanding-fourier-transforms",
                "author_id": "60d21b4967d0d8992e610c85",
                "tags": ["mathematics", "signal processing", "physics"],
                "featured_image": "/media/images/fourier-transform.jpg",
                "is_published": True,
            }
        }