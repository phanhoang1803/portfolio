# backend/app/models/user.py
from datetime import datetime
from typing import Optional, List
from pydantic import Field, EmailStr
from bson import ObjectId
from .base import PyObjectId, MongoBaseModel

class User(MongoBaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    username: str
    email: EmailStr
    hashed_password: str
    full_name: Optional[str] = None
    is_admin: bool = False
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        collection = "users"
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "username": "jdoe",
                "email": "john.doe@example.com",
                "hashed_password": "hashed_password_here",
                "full_name": "John Doe",
                "is_admin": True,
                "bio": "Math enthusiast and computer scientist",
                "profile_image": "/media/images/profile.jpg",
            }
        }