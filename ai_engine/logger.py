# Logging utility for AI operations
import logging
import os
from datetime import datetime
from pathlib import Path

class AILogger:
    """Centralized logging for AI operations with traceability"""
    
    def __init__(self):
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
        
        # Setup logger
        self.logger = logging.getLogger("paxipm_ai")
        self.logger.setLevel(logging.INFO)
        
        # File handler
        log_file = self.log_dir / f"ai_engine_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.WARNING)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        # Add handlers
        if not self.logger.handlers:
            self.logger.addHandler(file_handler)
            self.logger.addHandler(console_handler)
    
    def log_request(self, endpoint: str, request_data: dict, user_id: str = None):
        """Log AI request"""
        self.logger.info(
            f"AI Request - Endpoint: {endpoint}, User: {user_id}, "
            f"Data: {request_data}"
        )
    
    def log_response(self, endpoint: str, response_data: dict, duration: float):
        """Log AI response"""
        self.logger.info(
            f"AI Response - Endpoint: {endpoint}, Duration: {duration}s, "
            f"Response: {response_data}"
        )
    
    def log_error(self, endpoint: str, error: Exception, context: dict = None):
        """Log AI error"""
        error_msg = f"AI Error - Endpoint: {endpoint}, Error: {str(error)}"
        if context:
            error_msg += f", Context: {context}"
        self.logger.error(error_msg, exc_info=True)
    
    def log_validation(self, endpoint: str, is_valid: bool, errors: list):
        """Log validation results"""
        status = "PASSED" if is_valid else "FAILED"
        self.logger.info(
            f"Validation {status} - Endpoint: {endpoint}, Errors: {errors}"
        )

# Global logger instance
logger = AILogger()

