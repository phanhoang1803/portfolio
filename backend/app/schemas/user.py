# backend/app/schemas/user.py
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from bson import ObjectId

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    password: Optional[str] = None

class UserInDB(UserBase):
    id: str = Field(..., alias="_id")
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        from_attributes = True

class UserResponse(UserInDB):
    @field_validator('id', mode='before')
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