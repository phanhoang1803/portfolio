# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .config import settings
from .api.router import api_router

app = FastAPI(title=settings.PROJECT_NAME, version=settings.PROJECT_VERSION)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

# Create media directory if it doesn't exist
os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
os.makedirs(os.path.join(settings.MEDIA_ROOT, "images"), exist_ok=True)

# Mount static files for media uploads
app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "description": "Academic Blog and Portfolio API",
        "docs_url": "/docs",
    }