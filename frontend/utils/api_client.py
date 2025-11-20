"""
API Client Module
HTTP client for communicating with the backend API
"""

import os
import requests
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Backend API base URL
API_BASE_URL = os.getenv('BACKEND_API_URL', 'http://localhost:3000')


class APIClient:
    """HTTP client for backend API communication"""

    def __init__(self, base_url: str = API_BASE_URL):
        """Initialize API client with base URL"""
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()

    def _make_request(
        self, method: str, endpoint: str, data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Makes HTTP request to the backend API
        
        Args:
            method: HTTP method (GET, POST, PATCH, DELETE)
            endpoint: API endpoint path
            data: Request payload (optional)
            
        Returns:
            API response as dictionary
        """
        url = f"{self.base_url}/api/{endpoint.lstrip('/')}"
        
        try:
            response = self.session.request(method, url, json=data, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': 0
            }

    # ============ Sprint Methods ============

    def get_sprints(self) -> Dict[str, Any]:
        """Fetches all sprints"""
        return self._make_request('GET', '/sprints')

    def get_sprint_work_items(self, sprint_id: str) -> Dict[str, Any]:
        """Fetches work items for a specific sprint"""
        return self._make_request('GET', f'/sprints/{sprint_id}/workitems')

    def get_current_sprint_metrics(self) -> Dict[str, Any]:
        """Fetches metrics for the current sprint"""
        return self._make_request('GET', '/sprints/current/metrics')

    # ============ Work Item Methods ============

    def create_work_item(
        self,
        work_item_type: str,
        title: str,
        description: Optional[str] = None,
        assigned_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """Creates a new work item"""
        data = {
            'workItemType': work_item_type,
            'title': title,
            'description': description,
            'assignedTo': assigned_to
        }
        return self._make_request('POST', '/workitems', data)

    def get_work_item(self, work_item_id: int) -> Dict[str, Any]:
        """Gets a specific work item"""
        return self._make_request('GET', f'/workitems/{work_item_id}')

    def update_work_item(self, work_item_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Updates a work item"""
        return self._make_request('PATCH', f'/workitems/{work_item_id}', {'updates': updates})

    def delete_work_item(self, work_item_id: int) -> Dict[str, Any]:
        """Deletes a work item"""
        return self._make_request('DELETE', f'/workitems/{work_item_id}')

    # ============ AI Analysis Methods ============

    def analyze_sprint(
        self, sprint_data: Dict, work_items: List[Dict], context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyzes sprint data with AI"""
        data = {
            'sprintData': sprint_data,
            'workItems': work_items,
            'context': context
        }
        return self._make_request('POST', '/ai/analyze-sprint', data)

    def get_work_item_recommendations(self, work_item: Dict) -> Dict[str, Any]:
        """Gets AI recommendations for a work item"""
        return self._make_request('POST', '/ai/workitem-recommendations', {'workItem': work_item})

    # ============ MCP Methods ============

    def get_mcp_status(self) -> Dict[str, Any]:
        """Gets MCP server status"""
        return self._make_request('GET', '/mcp/status')

    def send_mcp_command(self, command: str, payload: Dict) -> Dict[str, Any]:
        """Sends a command to MCP server"""
        return self._make_request('POST', '/mcp/command', {'command': command, 'payload': payload})

    def query_mcp(self, query: str) -> Dict[str, Any]:
        """Queries MCP server"""
        return self._make_request('POST', '/mcp/query', {'query': query})

    # ============ Health Check ============

    def health_check(self) -> Dict[str, Any]:
        """Checks backend server health"""
        url = f"{self.base_url}/health"
        try:
            response = self.session.get(url, timeout=5)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {'status': 'unhealthy', 'error': str(e)}
