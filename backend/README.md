# Swipe Backend

A FastAPI backend for the Swipe browser extension.

## Setup

1. Create a Python 3.12 virtual environment:
```
python3.12 -m venv venv
```

2. Activate the virtual environment:
```
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate  # On Windows
```

3. Install dependencies:
```
pip install fastapi uvicorn sqlalchemy pydantic
```

## Running the Application

Start the FastAPI application:
```
uvicorn app.main:app --reload
```

This will start the API server at http://localhost:8000

## API Documentation

Once the server is running, you can access:
- Swagger UI documentation: http://localhost:8000/docs
- ReDoc documentation: http://localhost:8000/redoc

## Features

- Credit card management API
- Merchant detection based on URL
- Card recommendation algorithm
- Sample data for 5 major credit cards and retailers

## Database

The application uses SQLite for simplicity. The database is automatically created and populated with sample data when the application starts. 