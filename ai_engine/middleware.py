# Security middleware for AI Engine
import os
from fastapi import HTTPException

def check_api_key():
    """Verify OpenAI API key is configured"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured"
        )
    return api_key

