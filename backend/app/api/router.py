# backend/app/api/router.py
from fastapi import APIRouter
from .endpoints import posts, auth

api_router = APIRouter()

# Include routers from endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])