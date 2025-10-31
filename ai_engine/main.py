# AI Engine main entry point
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import time
from dotenv import load_dotenv
from ai_manager import AIManager
from validation import ResponseValidator
from logger import logger
from middleware import check_api_key

load_dotenv()

app = FastAPI(title="PaxiPM AI Engine")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Manager
ai_manager = AIManager()
validator = ResponseValidator()

# Request models
class CharterRequest(BaseModel):
    projectName: str
    description: str
    client: str = None

class RiskRequest(BaseModel):
    project_id: int

class ProjectSetupRequest(BaseModel):
    project: str
    progress: int

class RiskAnalysisRequest(BaseModel):
    project_description: str
    duration: str
    team_size: int

class ReportingRequest(BaseModel):
    progress_data: str

class PMOReportRequest(BaseModel):
    project_data: str

# Root route
@app.get("/")
def root():
    return {"message": "PaxiPM AI Engine Running"}

# Generate project charter
@app.post("/generate-charter")
async def generate_charter(req: CharterRequest):
    try:
        # Verify API key
        check_api_key()
        
        # Log request
        logger.log_request("generate-charter", req.dict())
        
        charter = await ai_manager.generate_charter(
            req.projectName,
            req.description,
            req.client
        )
        
        return {"projectName": req.projectName, "charter": charter}
    except Exception as e:
        logger.log_error("generate-charter", e)
        raise HTTPException(status_code=500, detail=str(e))

# Calculate risk score
@app.post("/calculate-risk")
async def calculate_risk(req: RiskRequest):
    try:
        # Verify API key
        check_api_key()
        
        # Log request
        logger.log_request("calculate-risk", req.dict())
        
        risk_score = await ai_manager.calculate_risk_score(req.project_id)
        
        response = {"risk_score": risk_score, "project_id": req.project_id}
        logger.log_response("calculate-risk", response, 0)
        
        return response
    except Exception as e:
        logger.log_error("calculate-risk", e)
        raise HTTPException(status_code=500, detail=str(e))

# Project setup (Model Flow example)
@app.post("/project-setup")
async def project_setup(req: ProjectSetupRequest):
    """
    Complete model flow:
    1. Backend sends JSON → FastAPI receives
    2. LangChain builds structured prompt
    3. OpenAI GPT-4 responds
    4. Response parsed and validated
    5. Return structured JSON
    """
    start_time = time.time()
    
    try:
        # Verify API key
        check_api_key()
        
        # Log request
        request_data = req.dict()
        logger.log_request("project-setup", request_data)
        
        # Step 1: FastAPI received JSON (already done via Pydantic)
        
        # Step 2 & 3: LangChain builds prompt and OpenAI responds
        response_text = await ai_manager.generate_project_setup(
            req.project,
            req.progress
        )
        
        # Step 4: Parse and validate response
        validation_result = validator.validate_project_setup(response_text)
        
        if not validation_result["valid"]:
            logger.log_validation("project-setup", False, validation_result["errors"])
            raise HTTPException(
                status_code=500,
                detail=f"Validation failed: {validation_result['errors']}"
            )
        
        logger.log_validation("project-setup", True, [])
        
        # Step 5: Return structured JSON
        duration = time.time() - start_time
        response = {
            "status": "success",
            "data": validation_result["data"],
            "metadata": {
                "project": req.project,
                "progress": req.progress,
                "processed_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }
        }
        
        logger.log_response("project-setup", response, duration)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.log_error("project-setup", e, req.dict())
        raise HTTPException(status_code=500, detail=str(e))

# Risk Analysis endpoint
@app.post("/risk-analysis")
async def risk_analysis(req: RiskAnalysisRequest):
    """
    Generate comprehensive project management documentation:
    - Project Charter
    - Work Breakdown Structure (WBS)
    - Key Risks
    
    Based on: Project Description, Duration, Team Size
    """
    start_time = time.time()
    
    try:
        # Verify API key
        check_api_key()
        
        # Log request
        request_data = req.dict()
        logger.log_request("risk-analysis", request_data)
        
        # Generate risk analysis using AI
        response_text = await ai_manager.generate_risk_analysis(
            req.project_description,
            req.duration,
            req.team_size
        )
        
        # Validate response
        validation_result = validator.validate_risk_analysis(response_text)
        
        if not validation_result["valid"]:
            logger.log_validation("risk-analysis", False, validation_result["errors"])
            raise HTTPException(
                status_code=500,
                detail=f"Validation failed: {validation_result['errors']}"
            )
        
        logger.log_validation("risk-analysis", True, [])
        
        # Return structured JSON
        duration = time.time() - start_time
        response = {
            "status": "success",
            "data": validation_result["data"],
            "metadata": {
                "project_description": req.project_description,
                "duration": req.duration,
                "team_size": req.team_size,
                "processed_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }
        }
        
        logger.log_response("risk-analysis", response, duration)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.log_error("risk-analysis", e, req.dict())
        raise HTTPException(status_code=500, detail=str(e))

# Reporting endpoint (Progress analysis + Risk rating)
@app.post("/reporting")
async def generate_report(req: ReportingRequest):
    """
    Analyze project progress data and generate risk report:
    - Identify risks from progress data
    - Rate overall risk score (0-100)
    - Provide risk summary
    - Generate actionable recommendations
    """
    start_time = time.time()
    
    try:
        # Verify API key
        check_api_key()
        
        # Log request
        request_data = req.dict()
        logger.log_request("reporting", request_data)
        
        # Generate report using AI
        response_text = await ai_manager.generate_report(req.progress_data)
        
        # Validate response
        validation_result = validator.validate_reporting(response_text)
        
        if not validation_result["valid"]:
            logger.log_validation("reporting", False, validation_result["errors"])
            raise HTTPException(
                status_code=500,
                detail=f"Validation failed: {validation_result['errors']}"
            )
        
        logger.log_validation("reporting", True, [])
        
        # Return structured JSON
        duration = time.time() - start_time
        response = {
            "status": "success",
            "data": validation_result["data"],
            "metadata": {
                "processed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "analysis_duration": round(duration, 2)
            }
        }
        
        logger.log_response("reporting", response, duration)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.log_error("reporting", e, req.dict())
        raise HTTPException(status_code=500, detail=str(e))

# PMO Report endpoint
@app.post("/pmo-report")
async def generate_pmo_report(req: PMOReportRequest):
    """
    Generate professional PMO status report:
    - Executive summary with status
    - Achievements & milestones
    - Blockers & challenges
    - Next actions (immediate, short-term, decisions, resources, escalations)
    - Metrics & KPIs
    - Risk updates
    
    Returns both plain text and JSON summary
    """
    start_time = time.time()
    
    try:
        # Verify API key
        check_api_key()
        
        # Log request
        request_data = req.dict()
        logger.log_request("pmo-report", request_data)
        
        # Generate PMO report using AI
        response_text = await ai_manager.generate_pmo_report(req.project_data)
        
        # Validate and parse response (extracts plain text and JSON)
        validation_result = validator.validate_pmo_report(response_text)
        
        if not validation_result["valid"]:
            logger.log_validation("pmo-report", False, validation_result["errors"])
            raise HTTPException(
                status_code=500,
                detail=f"Validation failed: {validation_result['errors']}"
            )
        
        logger.log_validation("pmo-report", True, [])
        
        # Return both formats
        duration = time.time() - start_time
        response = {
            "status": "success",
            "data": validation_result["data"],
            "metadata": {
                "processed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "report_generation_duration": round(duration, 2)
            }
        }
        
        logger.log_response("pmo-report", response, duration)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.log_error("pmo-report", e, req.dict())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
