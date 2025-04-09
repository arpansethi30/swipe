#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload 