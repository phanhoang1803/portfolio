# backend/app/schemas/auth.py
from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None
    is_admin: Optional[bool] = False

class LoginRequest(BaseModel):
    username: str
    password: str