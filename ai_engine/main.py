from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import openai
from typing import Optional

# Load environment variables
load_dotenv()

app = FastAPI(
    title="PaxiPM AI Engine",
    description="AI-powered project management engine using OpenAI",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY and OPENAI_API_KEY != "your_openai_api_key_here":
    try:
        from openai import OpenAI
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        print("✅ OpenAI API configured successfully")
    except Exception as e:
        print(f"⚠️  OpenAI initialization error: {e}")
        openai_client = None
else:
    print("⚠️  Warning: OPENAI_API_KEY not found or not configured. AI features will use placeholder responses.")
    openai_client = None

class CharterRequest(BaseModel):
    projectName: str
    description: str
    client: Optional[str] = None

class RiskRequest(BaseModel):
    projectId: int
    projectData: dict

class ProjectSetupRequest(BaseModel):
    projectName: str
    description: str
    duration: str
    teamSize: int

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "message": "PaxiPM AI Engine Running",
        "openai_configured": bool(OPENAI_API_KEY)
    }

@app.post("/generate-charter")
def generate_charter(req: CharterRequest):
    """
    Generate AI-powered project charter
    
    Args:
        req: CharterRequest with projectName and description
        
    Returns:
        JSON with projectName and generated charter text
    """
    if not openai_client:
        # Fallback placeholder response
        charter_text = f"""# Project Charter: {req.projectName}

## Project Description
{req.description}

## Objective
To successfully deliver {req.projectName} within scope, time, and budget constraints.

## Scope
The project will cover all aspects mentioned in the project description, ensuring comprehensive delivery of objectives.

## Stakeholders
- Project Sponsor: {req.client or 'To be determined'}
- Project Manager: Assigned
- Team Members: To be assigned

## Timeline
Project timeline will be determined based on detailed planning phase.

## Success Criteria
- Successful completion of all project deliverables
- Stakeholder satisfaction
- On-time and within budget delivery

---
*Note: This is a placeholder response. Configure OPENAI_API_KEY in .env for AI-generated content.*
"""
        return {"projectName": req.projectName, "charter": charter_text}
    
    try:
        # OpenAI API call using new client format
        response = openai_client.chat.completions.create(
            model="gpt-4",  # or gpt-3.5-turbo for faster/cheaper
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert project management consultant. Generate professional project charters following PMP standards."
                },
                {
                    "role": "user",
                    "content": f"""Generate a comprehensive project charter for:

Project Name: {req.projectName}
Description: {req.description}
Client: {req.client or 'Not specified'}

Include:
1. Project Overview
2. Objectives
3. Scope
4. Stakeholders
5. Success Criteria
6. Timeline Overview

Format as professional markdown."""
                }
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        charter_text = response.choices[0].message.content.strip()
        return {"projectName": req.projectName, "charter": charter_text}
        
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        # Return fallback response on error
        charter_text = f"# Project Charter: {req.projectName}\n\n{req.description}\n\n[AI generation temporarily unavailable]"
        return {"projectName": req.projectName, "charter": charter_text}

@app.post("/analyze-risk")
def analyze_risk(req: RiskRequest):
    """
    Analyze project risk using AI
    
    Args:
        req: RiskRequest with projectId and projectData
        
    Returns:
        JSON with risk_score (0-100), risk_summary, and recommendations
    """
    if not openai_client:
        # Fallback placeholder response
        return {
            "risk_score": 50,
            "risk_summary": "Risk analysis requires OpenAI API configuration.",
            "recommendations": [
                "Configure OPENAI_API_KEY in environment variables",
                "Review project data for potential risks",
                "Establish risk mitigation strategies"
            ]
        }
    
    try:
        # Prepare project data summary for AI
        project_summary = f"Project ID: {req.projectId}\n"
        project_summary += f"Project Data: {str(req.projectData)}"
        
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a risk analysis expert. Analyze project data and provide risk scores (0-100), summaries, and actionable recommendations. Always respond with valid JSON."
                },
                {
                    "role": "user",
                    "content": f"""Analyze the following project data and provide:

1. Risk Score (0-100): Integer score
2. Risk Summary: Brief summary of identified risks
3. Recommendations: List of actionable recommendations

Project Data:
{project_summary}

Respond ONLY with valid JSON format (no markdown, no code blocks):
{{
    "risk_score": <integer 0-100>,
    "risk_summary": "<text>",
    "recommendations": ["<recommendation1>", "<recommendation2>"]
}}"""
                }
            ],
            temperature=0.5,
            max_tokens=800,
            response_format={"type": "json_object"}
        )
        
        # Parse AI response
        import json
        ai_response = response.choices[0].message.content.strip()
        
        # Parse JSON response
        try:
            risk_data = json.loads(ai_response)
            return risk_data
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "risk_score": 50,
                "risk_summary": ai_response[:200] if ai_response else "Analysis unavailable",
                "recommendations": ["Review AI response for detailed recommendations"]
            }
            
    except Exception as e:
        print(f"Risk Analysis Error: {str(e)}")
        return {
            "risk_score": 50,
            "risk_summary": "Risk analysis temporarily unavailable.",
            "recommendations": ["Check project data quality", "Retry analysis later"]
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
