# Academic Portfolio

A full-stack web application for managing and displaying academic content with a private admin interface for posting and a public view for readers. Built with FastAPI, MongoDB, React, and TailwindCSS.

## Features

- **Private Admin Interface**:
  - Authentication with JWT
  - Create, edit, and manage posts
  - Rich text editor with Markdown support
  - Upload and manage images
  - Draft/publish workflow

- **Public Frontend**:
  - Responsive design with TailwindCSS
  - View published posts
  - Support for math formulas using LaTeX
  - Syntax highlighting for code blocks
  - Tag-based filtering and search

- **Technical Features**:
  - FastAPI backend API
  - MongoDB database
  - React frontend with Vite
  - Markdown support with math rendering
  - Docker Compose setup for easy deployment

## Project Structure

The project is organized into two main parts:

1. **Backend**: A FastAPI application that provides the API endpoints and connects to MongoDB.
2. **Frontend**: A React application built with Vite and TailwindCSS.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Python 3.9+ (for local development)

### Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/academic-portfolio.git
   cd academic-portfolio
   ```

2. Create necessary environment files:
   ```bash
   # Create backend .env file
   cp backend/.env.example backend/.env
   
   # Create frontend .env file
   cp frontend/.env.example frontend/.env
   ```

3. Start the application with Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Initialize the admin user (first time setup):
   ```bash
   curl -X POST http://localhost:8000/api/auth/init-admin
   ```

5. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000/api
   - API Documentation: http://localhost:8000/docs

### Default Admin Credentials

- Username: `admin`
- Password: `adminpassword`

**Important**: Change these credentials in the `docker-compose.yml` file before deploying to production.

## Development

### Backend Development

1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the backend in development mode:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Development

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Run the frontend in development mode:
   ```bash
   npm run dev
   ```

## Future Extensions

- PDF-based multiple-choice question generator
- User registration and permissions management
- Comment system
- Interactive applications embedded in posts

## License

[MIT License](LICENSE)