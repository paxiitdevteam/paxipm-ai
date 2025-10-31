# AI Manager - handles AI operations
import os
from openai import OpenAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import psycopg2
from dotenv import load_dotenv

load_dotenv()

class AIManager:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.llm = ChatOpenAI(model="gpt-4", temperature=0.7) if os.getenv("OPENAI_API_KEY") else None
        
        # Database connection for fetching project data
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432'),
            'database': os.getenv('DB_NAME', 'paxipm'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD')
        }
    
    async def generate_charter(self, projectName: str, description: str, client: str = None):
        """Generate project charter using AI"""
        try:
            # Load prompt template
            prompt_template = self._load_prompt_template('charter')
            
            # Format prompt
            prompt = prompt_template.format(
                project_title=projectName,
                description=description,
                client=client or "Internal"
            )
            
            # Generate using OpenAI
            if self.llm:
                response = self.llm.invoke([HumanMessage(content=prompt)])
                return response.content
            else:
                # Fallback: use OpenAI client directly
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating charter: {e}")
            raise
    
    async def calculate_risk_score(self, project_id: int):
        """Calculate risk score for a project"""
        try:
            # Fetch project data from database
            project_data = self._fetch_project_data(project_id)
            
            # Load risk analysis prompt
            prompt_template = self._load_prompt_template('risk')
            
            # Format prompt with project data
            prompt = prompt_template.format(
                project_title=project_data.get('title', ''),
                description=project_data.get('description', ''),
                tasks_count=project_data.get('tasks_count', 0),
                overdue_tasks=project_data.get('overdue_tasks', 0),
                avg_progress=project_data.get('avg_progress', 0)
            )
            
            # Generate risk analysis
            if self.llm:
                response = self.llm.invoke([HumanMessage(content=prompt)])
                response_text = response.content
            else:
                # Fallback: use OpenAI client directly
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}]
                )
                response_text = response.choices[0].message.content
            
            # Parse risk score from response (0-100)
            risk_score = self._parse_risk_score(response_text)
            
            return risk_score
        except Exception as e:
            print(f"Error calculating risk score: {e}")
            raise
    
    def _load_prompt_template(self, template_name: str) -> str:
        """Load prompt template from file"""
        import os
        base_dir = os.path.dirname(os.path.abspath(__file__))
        template_path = os.path.join(base_dir, "prompts", f"{template_name}.txt")
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            # Return default template if file doesn't exist
            return self._get_default_template(template_name)
    
    def _get_default_template(self, template_name: str) -> str:
        """Get default prompt template"""
        if template_name == 'charter':
            return """Generate a comprehensive project charter for the following project:

Project Title: {project_title}
Description: {description}
Client: {client}

Include:
1. Project Overview
2. Objectives and Goals
3. Scope and Deliverables
4. Timeline
5. Key Stakeholders
6. Success Criteria"""
        
        elif template_name == 'risk':
            return """Analyze the risk level for this project and provide a risk score (0-100):

Project Title: {project_title}
Description: {description}
Total Tasks: {tasks_count}
Overdue Tasks: {overdue_tasks}
Average Progress: {avg_progress}%

Provide only a single number between 0-100 representing the risk score."""
        
        elif template_name == 'project_setup_prompt':
            return """Generate a comprehensive project setup document for the following project:

Project: {project}
Progress: {progress}%

Include:
1. Project Overview (description, objectives, outcomes)
2. Work Breakdown Structure (phases, deliverables, tasks)
3. Timeline (start date, milestones, completion date)
4. Resource Allocation (team members, skills, effort)
5. Risk Assessment (risks, mitigation, contingencies)

Return structured JSON format."""
        
        elif template_name == 'risk_analysis_prompt':
            return """You are an expert PMP, ITIL, and Agile project manager.

Given the following project input:
Project Description: {project_description}
Duration: {duration}
Team Size: {team_size}

Generate:
1. Project Charter (executive summary, objectives, success criteria, stakeholders)
2. Work Breakdown Structure (phases, deliverables, tasks with assignments)
3. Key Risks (risk identification, assessment, mitigation strategies)

Return results in structured JSON format."""
        
        elif template_name == 'reporting_prompt':
            return """You are an expert project manager analyzing project progress data.

Analyze the following project progress data:
<Progress Data>
{progress_data}
</Progress Data>

Based on this data:
1. Identify risks (schedule, resource, technical, budget, quality, stakeholder)
2. Rate overall risk score (0-100): 0-20 Very Low, 21-40 Low, 41-60 Medium, 61-80 High, 81-100 Critical
3. Provide risk summary with key risk areas and project health
4. Generate actionable recommendations (immediate, short-term, medium-term, strategic)

Return JSON with risk_score, risk_summary, and recommendations."""
        
        elif template_name == 'pmo_report_prompt':
            return """You are a professional PMO analyst generating a comprehensive project status report.

Analyze the provided project information and generate a professional PMO status report.

Project Information:
{project_data}

Generate a comprehensive status report that includes:
1. Executive Summary (status, health, key highlight)
2. Achievements & Milestones (completed milestones, deliverables, accomplishments)
3. Blockers & Challenges (active blockers, constraints, challenges)
4. Next Actions (immediate, short-term, decisions, resources, escalations)
5. Metrics & KPIs (schedule, budget, scope, quality, resources)
6. Risk Update (new risks, status changes, mitigation)

Return in format:
---PLAIN TEXT REPORT---
[Professional formatted text report]
---END PLAIN TEXT REPORT---

---JSON SUMMARY---
[Structured JSON data]
---END JSON SUMMARY---"""
        
        return ""
    
    def _fetch_project_data(self, project_id: int) -> dict:
        """Fetch project data from database"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            
            # Fetch project
            cursor.execute(
                "SELECT title, description FROM projects WHERE id = %s",
                (project_id,)
            )
            project = cursor.fetchone()
            
            # Fetch tasks stats
            cursor.execute(
                """SELECT 
                    COUNT(*) as tasks_count,
                    COUNT(CASE WHEN due_date < CURRENT_DATE AND progress < 100 THEN 1 END) as overdue_tasks,
                    AVG(progress) as avg_progress
                   FROM tasks WHERE project_id = %s""",
                (project_id,)
            )
            stats = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            return {
                'title': project[0] if project else '',
                'description': project[1] if project else '',
                'tasks_count': stats[0] if stats else 0,
                'overdue_tasks': stats[1] if stats else 0,
                'avg_progress': round(stats[2], 1) if stats and stats[2] else 0
            }
        except Exception as e:
            print(f"Error fetching project data: {e}")
            return {}
    
    async def generate_project_setup(self, project: str, progress: int):
        """Generate project setup using structured prompt"""
        try:
            # Load project setup prompt template
            prompt_template = self._load_prompt_template('project_setup_prompt')
            
            # Format prompt
            prompt = prompt_template.format(
                project=project,
                progress=progress
            )
            
            # Generate using OpenAI
            if self.llm:
                response = self.llm.invoke([HumanMessage(content=prompt)])
                return response.content
            else:
                # Fallback: use OpenAI client directly
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"}  # Force JSON response
                )
                return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating project setup: {e}")
            raise
    
    async def generate_risk_analysis(self, project_description: str, duration: str, team_size: int):
        """Generate risk analysis with Charter, WBS, and Risks"""
        try:
            # Load risk analysis prompt template
            prompt_template = self._load_prompt_template('risk_analysis_prompt')
            
            # Format prompt
            prompt = prompt_template.format(
                project_description=project_description,
                duration=duration,
                team_size=team_size
            )
            
            # Generate using OpenAI
            if self.llm:
                response = self.llm.invoke([HumanMessage(content=prompt)])
                return response.content
            else:
                # Fallback: use OpenAI client directly
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"}  # Force JSON response
                )
                return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating risk analysis: {e}")
            raise
    
    async def generate_report(self, progress_data: str):
        """Generate risk report from progress data"""
        try:
            # Load reporting prompt template
            prompt_template = self._load_prompt_template('reporting_prompt')
            
            # Format prompt
            prompt = prompt_template.format(
                progress_data=progress_data
            )
            
            # Generate using OpenAI
            if self.llm:
                response = self.llm.invoke([HumanMessage(content=prompt)])
                return response.content
            else:
                # Fallback: use OpenAI client directly
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"}  # Force JSON response
                )
                return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating report: {e}")
            raise
    
    async def generate_pmo_report(self, project_data: str):
        """Generate professional PMO status report with plain text and JSON"""
        try:
            # Load PMO report prompt template
            prompt_template = self._load_prompt_template('pmo_report_prompt')
            
            # Format prompt
            prompt = prompt_template.format(
                project_data=project_data
            )
            
            # Generate using OpenAI (note: we can't force JSON format here as we need plain text too)
            if self.llm:
                response = self.llm.invoke([HumanMessage(content=prompt)])
                return response.content
            else:
                # Fallback: use OpenAI client directly
                response = self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating PMO report: {e}")
            raise
    
    def _parse_risk_score(self, response: str) -> int:
        """Parse risk score from AI response"""
        try:
            # Extract number from response
            import re
            numbers = re.findall(r'\d+', response)
            if numbers:
                score = int(numbers[0])
                return max(0, min(100, score))  # Clamp between 0-100
            return 50  # Default medium risk
        except:
            return 50

