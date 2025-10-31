from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import openai
from typing import Optional, List, Dict, Any

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

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []
    project_context: Optional[Dict[str, Any]] = None
    language: str = "en"

class LessonsLearnedRequest(BaseModel):
    project_id: Optional[int] = None
    project_data: Dict[str, Any]

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
    Enhanced risk prediction using AI with predictive analytics
    
    Args:
        req: RiskRequest with projectId and projectData
        
    Returns:
        JSON with risk_score (0-100), risk_summary, recommendations, and predictive insights
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
                    "content": f"""Analyze the following project data and provide comprehensive risk assessment with predictive insights:

1. Risk Score (0-100): Integer score based on current and predicted risks
2. Risk Summary: Detailed summary of identified risks
3. Risk Categories: Breakdown by category (schedule, budget, resource, technical, etc.)
4. Recommendations: List of actionable recommendations with priority
5. Predictive Insights: Future risk predictions based on current patterns
6. Risk Trend: Predicted risk trend (increasing, stable, decreasing)
7. Early Warning Signals: Indicators of potential future issues

Project Data:
{project_summary}

Respond ONLY with valid JSON format (no markdown, no code blocks):
{{
    "risk_score": <integer 0-100>,
    "risk_summary": "<text>",
    "risk_categories": {{
        "schedule": <score 0-100>,
        "budget": <score 0-100>,
        "resource": <score 0-100>,
        "technical": <score 0-100>,
        "stakeholder": <score 0-100>
    }},
    "recommendations": [
        {{"action": "<text>", "priority": "<high|medium|low>"}}
    ],
    "predictive_insights": {{
        "trend": "<increasing|stable|decreasing>",
        "predicted_risks": ["<risk1>", "<risk2>"],
        "early_warnings": ["<warning1>", "<warning2>"]
    }}
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

@app.post("/chat")
def chat(req: ChatRequest):
    """
    AI Chat Assistant endpoint
    
    Args:
        req: ChatRequest with message, conversation_history, project_context, and language
        
    Returns:
        JSON with response message from AI
    """
    if not openai_client:
        # Fallback placeholder response
        return {
            "response": "I'm an AI assistant for project management. I can help you with:\n- Project planning and setup\n- Risk analysis\n- Progress reporting\n- Project management best practices\n\nTo enable full AI capabilities, please configure OPENAI_API_KEY in your environment.",
            "tokens_used": 0
        }
    
    try:
        # Build system prompt based on project context
        system_prompt = "You are an expert AI assistant for project management (PMP, ITIL, Agile, SAFe). You help project managers with:\n"
        system_prompt += "- Project planning and charter generation\n"
        system_prompt += "- Risk analysis and mitigation strategies\n"
        system_prompt += "- Progress reporting and status updates\n"
        system_prompt += "- Resource management and allocation\n"
        system_prompt += "- Best practices in project management\n"
        system_prompt += "- IT infrastructure and software delivery projects\n\n"
        system_prompt += "Provide clear, actionable advice based on project management frameworks."
        
        # Add project context if available
        if req.project_context:
            project_info = f"\nCurrent Project Context:\n"
            project_info += f"- Title: {req.project_context.get('title', 'N/A')}\n"
            project_info += f"- Description: {req.project_context.get('description', 'N/A')[:200]}\n"
            project_info += f"- Status: {req.project_context.get('status', 'N/A')}\n"
            if req.project_context.get('risk_score') is not None:
                project_info += f"- Risk Score: {req.project_context.get('risk_score')}/100\n"
            system_prompt += project_info
        
        # Build messages array with conversation history
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        for msg in req.conversation_history:
            if msg.get("role") and msg.get("content"):
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        # Add current user message
        messages.append({"role": "user", "content": req.message})
        
        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        ai_response = response.choices[0].message.content.strip()
        tokens_used = response.usage.total_tokens if hasattr(response, 'usage') else 0
        
        return {
            "response": ai_response,
            "tokens_used": tokens_used
        }
        
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return {
            "response": "I apologize, but I encountered an error processing your request. Please try again later.",
            "tokens_used": 0
        }

@app.post("/lessons-learned")
def lessons_learned(req: LessonsLearnedRequest):
    """
    Generate lessons learned report for a project
    
    Args:
        req: LessonsLearnedRequest with project_id and project_data
        
    Returns:
        JSON with lessons learned analysis
    """
    if not openai_client:
        # Fallback placeholder response
        return {
            "status": "success",
            "data": {
                "project_summary": "Lessons learned analysis requires OpenAI API configuration.",
                "what_went_well": [
                    "Project completed successfully",
                    "Team collaboration was effective"
                ],
                "what_could_improve": [
                    "Better risk management planning",
                    "More frequent status updates"
                ],
                "recommendations": [
                    "Implement more structured risk review process",
                    "Establish regular communication cadence"
                ],
                "key_insights": [
                    "Project management best practices identified",
                    "Areas for improvement documented"
                ]
            }
        }
    
    try:
        # Prepare project data summary for AI
        project_summary = f"Project ID: {req.project_id}\n" if req.project_id else ""
        project_summary += f"Project Data: {str(req.project_data)}"
        
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a project management expert specializing in lessons learned analysis. Analyze project data and provide comprehensive lessons learned reports with actionable insights."
                },
                {
                    "role": "user",
                    "content": f"""Generate a comprehensive lessons learned report for the following project:

{project_summary}

Provide a detailed analysis including:

1. Project Summary: Brief overview of the project
2. What Went Well: List of successful aspects and achievements
3. What Could Be Improved: Areas that needed improvement
4. Recommendations: Actionable recommendations for future projects
5. Key Insights: Important takeaways and patterns
6. Best Practices: Best practices identified during the project
7. Challenges Faced: Major challenges and how they were addressed

Format as structured JSON with clear sections."""
                }
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )
        
        # Parse AI response
        import json
        ai_response = response.choices[0].message.content.strip()
        
        try:
            lessons_data = json.loads(ai_response)
            return {
                "status": "success",
                "data": lessons_data
            }
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "status": "success",
                "data": {
                    "project_summary": "Project lessons learned analysis completed.",
                    "raw_response": ai_response[:500],
                    "what_went_well": ["Analysis generated"],
                    "what_could_improve": ["Review raw response for details"],
                    "recommendations": ["Implement insights from analysis"],
                    "key_insights": ["Lessons learned documented"]
                }
            }
            
    except Exception as e:
        print(f"Lessons Learned Error: {str(e)}")
        return {
            "status": "error",
            "error": "Failed to generate lessons learned report",
            "data": {
                "project_summary": "Lessons learned analysis temporarily unavailable.",
                "what_went_well": [],
                "what_could_improve": ["Analysis service unavailable"],
                "recommendations": ["Retry analysis later"],
                "key_insights": []
            }
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
