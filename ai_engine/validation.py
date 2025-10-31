# Output validation for AI responses
import json
import re
from typing import Dict, Any, Optional
from datetime import datetime

class ResponseValidator:
    """Validates AI responses with schema checking and auto-fill"""
    
    # JSON Schema for risk analysis response
    RISK_ANALYSIS_SCHEMA = {
        "type": "object",
        "required": ["project_charter", "work_breakdown_structure", "key_risks"],
        "properties": {
            "project_charter": {
                "type": "object",
                "required": ["executive_summary", "objectives", "success_criteria"],
                "properties": {
                    "executive_summary": {"type": "string"},
                    "objectives": {"type": "array", "items": {"type": "string"}},
                    "success_criteria": {"type": "array", "items": {"type": "string"}},
                    "key_stakeholders": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "role": {"type": "string"},
                                "responsibility": {"type": "string"}
                            }
                        }
                    },
                    "budget_overview": {"type": "object"},
                    "timeline_overview": {"type": "object"}
                }
            },
            "work_breakdown_structure": {
                "type": "object",
                "required": ["phases"],
                "properties": {
                    "phases": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["phase_name", "tasks"],
                            "properties": {
                                "phase_name": {"type": "string"},
                                "tasks": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "required": ["task_name"],
                                        "properties": {
                                            "task_name": {"type": "string"},
                                            "description": {"type": "string"},
                                            "assigned_role": {"type": "string"},
                                            "estimated_hours": {"type": "number"},
                                            "priority": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "key_risks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["risk_name", "probability", "impact"],
                    "properties": {
                        "risk_name": {"type": "string"},
                        "probability": {"type": "string"},
                        "impact": {"type": "string"},
                        "risk_score": {"type": "number"},
                        "mitigation_strategy": {"type": "string"}
                    }
                }
            }
        }
    }
    
    # JSON Schema for project setup response
    PROJECT_SETUP_SCHEMA = {
        "type": "object",
        "required": ["project_overview", "wbs", "timeline", "resources", "risks"],
        "properties": {
            "project_overview": {
                "type": "object",
                "required": ["description", "objectives", "outcomes"],
                "properties": {
                    "description": {"type": "string"},
                    "objectives": {"type": "array", "items": {"type": "string"}},
                    "outcomes": {"type": "array", "items": {"type": "string"}}
                }
            },
            "wbs": {
                "type": "object",
                "required": ["phases"],
                "properties": {
                    "phases": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["phase_name", "deliverables", "tasks"],
                            "properties": {
                                "phase_name": {"type": "string"},
                                "deliverables": {"type": "array", "items": {"type": "string"}},
                                "tasks": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "required": ["task_name", "description"],
                                        "properties": {
                                            "task_name": {"type": "string"},
                                            "description": {"type": "string"},
                                            "owner": {"type": "string"},
                                            "estimated_hours": {"type": "number"},
                                            "due_date": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "timeline": {
                "type": "object",
                "required": ["start_date", "milestones", "estimated_completion"],
                "properties": {
                    "start_date": {"type": "string"},
                    "milestones": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["milestone_name", "due_date"],
                            "properties": {
                                "milestone_name": {"type": "string"},
                                "due_date": {"type": "string"}
                            }
                        }
                    },
                    "estimated_completion": {"type": "string"}
                }
            },
            "resources": {
                "type": "object",
                "required": ["team_members"],
                "properties": {
                    "team_members": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["role"],
                            "properties": {
                                "role": {"type": "string"},
                                "skills": {"type": "array", "items": {"type": "string"}},
                                "allocation_percent": {"type": "number"}
                            }
                        }
                    }
                }
            },
            "risks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["risk_name"],
                    "properties": {
                        "risk_name": {"type": "string"},
                        "probability": {"type": "string"},
                        "impact": {"type": "string"},
                        "mitigation": {"type": "string"}
                    }
                }
            }
        }
    }
    
    @staticmethod
    def extract_json(text: str) -> Optional[str]:
        """Extract JSON from text response"""
        # Try to find JSON block
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            return json_match.group(0)
        
        # Try code block
        json_match = re.search(r'```json\s*(\{[\s\S]*\})\s*```', text)
        if json_match:
            return json_match.group(1)
        
        json_match = re.search(r'```\s*(\{[\s\S]*\})\s*```', text)
        if json_match:
            return json_match.group(1)
        
        return None
    
    @staticmethod
    def validate_and_fix(response_data: Dict[str, Any], schema: Dict) -> Dict[str, Any]:
        """Validate response against schema and auto-fix missing fields"""
        validated = response_data.copy()
        
        # Ensure required top-level fields exist
        for field in schema.get("required", []):
            if field not in validated:
                validated[field] = ResponseValidator._get_default_value(
                    schema["properties"][field]
                )
        
        # Recursively validate nested structures
        for key, value in validated.items():
            if key in schema.get("properties", {}):
                validated[key] = ResponseValidator._validate_field(
                    value,
                    schema["properties"][key]
                )
        
        return validated
    
    @staticmethod
    def _validate_field(value: Any, field_schema: Dict) -> Any:
        """Validate and fix a single field"""
        field_type = field_schema.get("type")
        
        if field_type == "object":
            result = value if isinstance(value, dict) else {}
            for subfield in field_schema.get("required", []):
                if subfield not in result:
                    result[subfield] = ResponseValidator._get_default_value(
                        field_schema.get("properties", {}).get(subfield, {})
                    )
            return result
        
        elif field_type == "array":
            if not isinstance(value, list):
                return []
            return [
                ResponseValidator._validate_field(item, field_schema.get("items", {}))
                for item in value
            ]
        
        elif field_type == "string":
            return str(value) if value is not None else ""
        
        elif field_type == "number":
            return float(value) if value is not None else 0
        
        return value
    
    @staticmethod
    def _get_default_value(field_schema: Dict) -> Any:
        """Get default value for a field based on schema"""
        field_type = field_schema.get("type")
        
        if field_type == "object":
            return {}
        elif field_type == "array":
            return []
        elif field_type == "string":
            return ""
        elif field_type == "number":
            return 0
        return None
    
    @staticmethod
    def validate_project_setup(response_text: str) -> Dict[str, Any]:
        """Validate project setup response"""
        try:
            # Extract JSON from response
            json_str = ResponseValidator.extract_json(response_text)
            if not json_str:
                raise ValueError("No JSON found in response")
            
            # Parse JSON
            response_data = json.loads(json_str)
            
            # Validate and fix
            validated = ResponseValidator.validate_and_fix(
                response_data,
                ResponseValidator.PROJECT_SETUP_SCHEMA
            )
            
            return {
                "valid": True,
                "data": validated,
                "errors": []
            }
        except json.JSONDecodeError as e:
            return {
                "valid": False,
                "data": None,
                "errors": [f"JSON parse error: {str(e)}"]
            }
        except Exception as e:
            return {
                "valid": False,
                "data": None,
                "errors": [f"Validation error: {str(e)}"]
            }
    
    @staticmethod
    def validate_risk_analysis(response_text: str) -> Dict[str, Any]:
        """Validate risk analysis response"""
        try:
            # Extract JSON from response
            json_str = ResponseValidator.extract_json(response_text)
            if not json_str:
                raise ValueError("No JSON found in response")
            
            # Parse JSON
            response_data = json.loads(json_str)
            
            # Validate and fix
            validated = ResponseValidator.validate_and_fix(
                response_data,
                ResponseValidator.RISK_ANALYSIS_SCHEMA
            )
            
            # Calculate risk scores if missing
            if "key_risks" in validated:
                for risk in validated["key_risks"]:
                    if "risk_score" not in risk or risk["risk_score"] is None:
                        risk["risk_score"] = ResponseValidator._calculate_risk_score(
                            risk.get("probability", "Medium"),
                            risk.get("impact", "Medium")
                        )
                    if "risk_level" not in risk:
                        risk["risk_level"] = ResponseValidator._get_risk_level(
                            risk.get("risk_score", 0)
                        )
            
            return {
                "valid": True,
                "data": validated,
                "errors": []
            }
        except json.JSONDecodeError as e:
            return {
                "valid": False,
                "data": None,
                "errors": [f"JSON parse error: {str(e)}"]
            }
        except Exception as e:
            return {
                "valid": False,
                "data": None,
                "errors": [f"Validation error: {str(e)}"]
            }
    
    @staticmethod
    def _calculate_risk_score(probability: str, impact: str) -> int:
        """Calculate risk score from probability and impact"""
        prob_map = {"Low": 1, "Medium": 2, "High": 3}
        impact_map = {"Low": 1, "Medium": 2, "High": 3}
        
        prob_value = prob_map.get(probability, 2)
        impact_value = impact_map.get(impact, 2)
        
        return prob_value * impact_value
    
    @staticmethod
    def _get_risk_level(risk_score: int) -> str:
        """Get risk level from score"""
        if risk_score <= 3:
            return "Low"
        elif risk_score <= 6:
            return "Medium"
        elif risk_score <= 8:
            return "High"
        else:
            return "Critical"
    
    # JSON Schema for reporting/risk analysis response
    REPORTING_SCHEMA = {
        "type": "object",
        "required": ["risk_score", "risk_summary", "recommendations"],
        "properties": {
            "risk_score": {
                "type": "number",
                "minimum": 0,
                "maximum": 100
            },
            "risk_level": {
                "type": "string",
                "enum": ["Very Low", "Low", "Medium", "High", "Critical"]
            },
            "risk_summary": {
                "type": "object",
                "required": ["overall_status", "key_risk_areas"],
                "properties": {
                    "overall_status": {"type": "string"},
                    "key_risk_areas": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["category", "description"],
                            "properties": {
                                "category": {"type": "string"},
                                "description": {"type": "string"},
                                "severity": {"type": "string"},
                                "impact": {"type": "string"}
                            }
                        }
                    },
                    "project_health": {"type": "string"},
                    "trend": {"type": "string"}
                }
            },
            "recommendations": {
                "type": "object",
                "required": ["immediate_actions"],
                "properties": {
                    "immediate_actions": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["action"],
                            "properties": {
                                "action": {"type": "string"},
                                "priority": {"type": "string"},
                                "owner": {"type": "string"},
                                "deadline": {"type": "string"}
                            }
                        }
                    },
                    "short_term_actions": {"type": "array"},
                    "medium_term_actions": {"type": "array"},
                    "strategic_recommendations": {"type": "array"},
                    "resource_suggestions": {"type": "array"},
                    "process_improvements": {"type": "array"}
                }
            },
            "metrics": {
                "type": "object",
                "properties": {
                    "schedule_health": {"type": "string"},
                    "budget_health": {"type": "string"},
                    "quality_health": {"type": "string"},
                    "resource_health": {"type": "string"},
                    "overall_health": {"type": "string"}
                }
            },
            "insights": {
                "type": "array",
                "items": {"type": "string"}
            }
        }
    }
    
    @staticmethod
    def validate_reporting(response_text: str) -> Dict[str, Any]:
        """Validate reporting/risk analysis response"""
        try:
            # Extract JSON from response
            json_str = ResponseValidator.extract_json(response_text)
            if not json_str:
                raise ValueError("No JSON found in response")
            
            # Parse JSON
            response_data = json.loads(json_str)
            
            # Validate and fix
            validated = ResponseValidator.validate_and_fix(
                response_data,
                ResponseValidator.REPORTING_SCHEMA
            )
            
            # Ensure risk_score is within bounds
            if "risk_score" in validated:
                validated["risk_score"] = max(0, min(100, int(validated["risk_score"])))
                
                # Auto-assign risk_level if missing
                if "risk_level" not in validated or not validated["risk_level"]:
                    validated["risk_level"] = ResponseValidator._get_reporting_risk_level(
                        validated["risk_score"]
                    )
            
            return {
                "valid": True,
                "data": validated,
                "errors": []
            }
        except json.JSONDecodeError as e:
            return {
                "valid": False,
                "data": None,
                "errors": [f"JSON parse error: {str(e)}"]
            }
        except Exception as e:
            return {
                "valid": False,
                "data": None,
                "errors": [f"Validation error: {str(e)}"]
            }
    
    @staticmethod
    def _get_reporting_risk_level(risk_score: int) -> str:
        """Get risk level from reporting risk score (0-100)"""
        if risk_score <= 20:
            return "Very Low"
        elif risk_score <= 40:
            return "Low"
        elif risk_score <= 60:
            return "Medium"
        elif risk_score <= 80:
            return "High"
        else:
            return "Critical"
    
    # JSON Schema for PMO report response
    PMO_REPORT_SCHEMA = {
        "type": "object",
        "required": ["executive_summary", "achievements", "blockers", "next_actions"],
        "properties": {
            "executive_summary": {
                "type": "object",
                "required": ["status", "overall_health", "key_highlight"],
                "properties": {
                    "status": {"type": "string"},
                    "overall_health": {"type": "string"},
                    "key_highlight": {"type": "string"},
                    "summary_text": {"type": "string"}
                }
            },
            "achievements": {
                "type": "object",
                "properties": {
                    "milestones_completed": {"type": "array"},
                    "deliverables_achieved": {"type": "array"},
                    "positive_indicators": {"type": "array"},
                    "team_accomplishments": {"type": "array"}
                }
            },
            "blockers": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["blocker_name", "description"],
                    "properties": {
                        "blocker_name": {"type": "string"},
                        "description": {"type": "string"},
                        "category": {"type": "string"},
                        "severity": {"type": "string"},
                        "impact": {"type": "string"},
                        "status": {"type": "string"}
                    }
                }
            },
            "next_actions": {
                "type": "object",
                "required": ["immediate_actions"],
                "properties": {
                    "immediate_actions": {"type": "array"},
                    "short_term_actions": {"type": "array"},
                    "decisions_required": {"type": "array"},
                    "resource_needs": {"type": "array"},
                    "escalation_items": {"type": "array"}
                }
            },
            "metrics": {"type": "object"},
            "risk_update": {"type": "object"},
            "report_metadata": {"type": "object"}
        }
    }
    
    @staticmethod
    def validate_pmo_report(response_text: str) -> Dict[str, Any]:
        """Validate PMO report response (extracts plain text and JSON)"""
        try:
            # Extract plain text report
            plain_text_match = re.search(
                r'---PLAIN TEXT REPORT---(.*?)---END PLAIN TEXT REPORT---',
                response_text,
                re.DOTALL
            )
            plain_text = plain_text_match.group(1).strip() if plain_text_match else ""
            
            # Extract JSON summary
            json_match = re.search(
                r'---JSON SUMMARY---(.*?)---END JSON SUMMARY---',
                response_text,
                re.DOTALL
            )
            
            if not json_match:
                raise ValueError("JSON summary not found in response")
            
            json_str = json_match.group(1).strip()
            
            # Parse JSON
            response_data = json.loads(json_str)
            
            # Validate and fix
            validated = ResponseValidator.validate_and_fix(
                response_data,
                ResponseValidator.PMO_REPORT_SCHEMA
            )
            
            return {
                "valid": True,
                "data": {
                    "plain_text_report": plain_text,
                    "json_summary": validated
                },
                "errors": []
            }
        except json.JSONDecodeError as e:
            return {
                "valid": False,
                "data": None,
                "errors": [f"JSON parse error: {str(e)}"]
            }
        except Exception as e:
            return {
                "valid": False,
                "data": None,
                "errors": [f"Validation error: {str(e)}"]
            }

