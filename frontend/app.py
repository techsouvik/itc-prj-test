"""
Azure DevOps Sprint Manager - Streamlit Frontend
Main dashboard application for sprint visualization and management
"""

import streamlit as st
from utils.api_client import APIClient
from datetime import datetime

# Page configuration
st.set_page_config(
    page_title="Azure DevOps Sprint Manager",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize API client
api = APIClient()

# ============ Helper Functions ============

def display_health_status():
    """Displays backend server health status in sidebar"""
    health = api.health_check()
    if health.get('status') == 'healthy':
        st.sidebar.success("✅ Backend Connected")
    else:
        st.sidebar.error("❌ Backend Disconnected")
        st.sidebar.caption(f"Error: {health.get('error', 'Unknown')}")

def format_work_item_state(state: str) -> str:
    """Formats work item state with emoji"""
    state_map = {
        'New': '🆕',
        'Active': '🔄',
        'In Progress': '🔄',
        'Done': '✅',
        'Closed': '✅',
        'Removed': '❌'
    }
    emoji = state_map.get(state, '📋')
    return f"{emoji} {state}"

# ============ Sidebar ============

st.sidebar.title("🎯 Sprint Manager")
display_health_status()

# Navigation
page = st.sidebar.radio(
    "Navigation",
    ["📊 Dashboard", "📝 Work Items", "🤖 AI Analysis", "🔧 MCP Controls"]
)

st.sidebar.markdown("---")
st.sidebar.caption(f"Last updated: {datetime.now().strftime('%H:%M:%S')}")

# ============ Main Content ============

st.title("Azure DevOps Sprint Manager")

# ============ Dashboard Page ============

if page == "📊 Dashboard":
    st.header("Sprint Dashboard")
    
    # Fetch current sprint metrics
    with st.spinner("Loading sprint data..."):
        metrics_response = api.get_current_sprint_metrics()
    
    if metrics_response.get('success'):
        metrics = metrics_response.get('data')
        
        if metrics:
            # Display sprint name
            st.subheader(f"Current Sprint: {metrics['sprintName']}")
            
            # Metrics cards
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("Total Work Items", metrics['totalWorkItems'])
            
            with col2:
                st.metric("Completed", metrics['completedWorkItems'])
            
            with col3:
                st.metric("In Progress", metrics['inProgressWorkItems'])
            
            with col4:
                completion_rate = (
                    metrics['completedWorkItems'] / metrics['totalWorkItems'] * 100
                    if metrics['totalWorkItems'] > 0 else 0
                )
                st.metric("Completion Rate", f"{completion_rate:.1f}%")
            
            # Work metrics
            st.markdown("---")
            col5, col6, col7 = st.columns(3)
            
            with col5:
                st.metric("Remaining Work", f"{metrics['remainingWork']} hrs")
            
            with col6:
                st.metric("Completed Work", f"{metrics['completedWork']} hrs")
            
            with col7:
                st.metric("Velocity", metrics['velocity'])
            
            # Progress bar
            st.markdown("---")
            st.subheader("Sprint Progress")
            progress = completion_rate / 100
            st.progress(progress)
        else:
            st.info("No active sprint found")
    else:
        st.error(f"Error loading sprint data: {metrics_response.get('error')}")

# ============ Work Items Page ============

elif page == "📝 Work Items":
    st.header("Work Item Management")
    
    # Create new work item section
    with st.expander("➕ Create New Work Item"):
        with st.form("create_work_item"):
            work_item_type = st.selectbox(
                "Type",
                ["Task", "Bug", "User Story", "Feature"]
            )
            title = st.text_input("Title *")
            description = st.text_area("Description")
            assigned_to = st.text_input("Assigned To (email)")
            
            submitted = st.form_submit_button("Create Work Item")
            
            if submitted and title:
                with st.spinner("Creating work item..."):
                    result = api.create_work_item(
                        work_item_type, title, description, assigned_to or None
                    )
                
                if result.get('success'):
                    st.success(f"✅ Work item created: #{result['data']['id']}")
                else:
                    st.error(f"Error: {result.get('error')}")
    
    # View work items
    st.markdown("---")
    st.subheader("Current Sprint Work Items")
    
    # Fetch sprints
    sprints_response = api.get_sprints()
    
    if sprints_response.get('success'):
        sprints = sprints_response.get('data', [])
        current_sprint = next(
            (s for s in sprints if s.get('attributes', {}).get('timeFrame') == 'current'),
            None
        )
        
        if current_sprint:
            # Fetch work items for current sprint
            work_items_response = api.get_sprint_work_items(current_sprint['id'])
            
            if work_items_response.get('success'):
                work_items = work_items_response.get('data', [])
                
                if work_items:
                    # Display work items in a table
                    for item in work_items:
                        fields = item.get('fields', {})
                        
                        with st.container():
                            col1, col2, col3 = st.columns([3, 2, 1])
                            
                            with col1:
                                st.markdown(f"**#{item['id']}** - {fields.get('System.Title', 'N/A')}")
                            
                            with col2:
                                st.caption(f"Type: {fields.get('System.WorkItemType', 'N/A')}")
                            
                            with col3:
                                state = fields.get('System.State', 'Unknown')
                                st.markdown(format_work_item_state(state))
                            
                            st.markdown("---")
                else:
                    st.info("No work items in current sprint")
            else:
                st.error(f"Error loading work items: {work_items_response.get('error')}")
        else:
            st.info("No current sprint found")
    else:
        st.error(f"Error loading sprints: {sprints_response.get('error')}")

# ============ AI Analysis Page ============

elif page == "🤖 AI Analysis":
    st.header("AI-Powered Sprint Analysis")
    
    st.markdown("""
    Get AI-driven insights on your sprint progress, including:
    - Impact assessment
    - Recommendations for improvement
    - Risk analysis
    - Release readiness evaluation
    """)
    
    if st.button("🚀 Analyze Current Sprint", type="primary"):
        with st.spinner("Analyzing sprint data with AI..."):
            # Fetch current sprint metrics
            metrics_response = api.get_current_sprint_metrics()
            
            if metrics_response.get('success'):
                metrics = metrics_response.get('data')
                
                if metrics:
                    # Fetch work items
                    sprints_response = api.get_sprints()
                    if sprints_response.get('success'):
                        sprints = sprints_response.get('data', [])
                        current_sprint = next(
                            (s for s in sprints if s.get('attributes', {}).get('timeFrame') == 'current'),
                            None
                        )
                        
                        if current_sprint:
                            work_items_response = api.get_sprint_work_items(current_sprint['id'])
                            
                            if work_items_response.get('success'):
                                work_items = work_items_response.get('data', [])
                                
                                # Analyze with AI
                                analysis_response = api.analyze_sprint(metrics, work_items)
                                
                                if analysis_response.get('success'):
                                    analysis = analysis_response.get('data', {})
                                    
                                    # Display results
                                    st.success("✅ Analysis Complete")
                                    
                                    # Impact
                                    st.subheader("📊 Impact Assessment")
                                    st.write(analysis.get('impact', 'N/A'))
                                    
                                    # Risk Level
                                    st.subheader("⚠️ Risk Level")
                                    risk = analysis.get('riskLevel', 'unknown')
                                    risk_colors = {
                                        'low': '🟢',
                                        'medium': '🟡',
                                        'high': '🔴'
                                    }
                                    st.markdown(f"{risk_colors.get(risk, '⚪')} **{risk.upper()}**")
                                    
                                    # Release Readiness
                                    st.subheader("🚀 Release Readiness")
                                    ready = analysis.get('releaseReadiness', False)
                                    if ready:
                                        st.success("✅ Ready for release")
                                    else:
                                        st.warning("⚠️ Not ready for release")
                                    
                                    # Recommendations
                                    st.subheader("💡 Recommendations")
                                    recommendations = analysis.get('recommendations', [])
                                    for rec in recommendations:
                                        st.markdown(f"- {rec}")
                                    
                                    # Guidelines
                                    st.subheader("📋 Guidelines")
                                    guidelines = analysis.get('guidelines', [])
                                    for guide in guidelines:
                                        st.markdown(f"- {guide}")
                                else:
                                    st.error(f"Error: {analysis_response.get('error')}")
                            else:
                                st.error("Failed to fetch work items")
                        else:
                            st.info("No current sprint found")
                    else:
                        st.error("Failed to fetch sprints")
                else:
                    st.info("No active sprint to analyze")
            else:
                st.error(f"Error: {metrics_response.get('error')}")

# ============ MCP Controls Page ============

elif page == "🔧 MCP Controls":
    st.header("MCP Server Controls")
    
    # Check MCP status
    status_response = api.get_mcp_status()
    
    if status_response.get('success'):
        status = status_response.get('data', {})
        
        if status.get('online'):
            st.success(f"✅ MCP Server Online (Version: {status.get('version', 'Unknown')})")
            
            # Send command section
            st.subheader("Send Command")
            with st.form("mcp_command"):
                command = st.text_input("Command")
                payload = st.text_area("Payload (JSON)", "{}")
                
                if st.form_submit_button("Send"):
                    import json
                    try:
                        payload_dict = json.loads(payload)
                        result = api.send_mcp_command(command, payload_dict)
                        
                        if result.get('success'):
                            st.success("Command sent successfully")
                            st.json(result.get('data'))
                        else:
                            st.error(f"Error: {result.get('error')}")
                    except json.JSONDecodeError:
                        st.error("Invalid JSON payload")
            
            # Query section
            st.markdown("---")
            st.subheader("Query MCP")
            query = st.text_input("Query")
            
            if st.button("Execute Query"):
                result = api.query_mcp(query)
                
                if result.get('success'):
                    st.success("Query executed successfully")
                    st.json(result.get('data'))
                else:
                    st.error(f"Error: {result.get('error')}")
        else:
            st.warning("⚠️ MCP Server Offline")
            st.info("MCP integration is disabled or the server is not reachable")
    else:
        st.error(f"Error checking MCP status: {status_response.get('error')}")

# ============ Footer ============

st.markdown("---")
st.caption("Azure DevOps Sprint Manager | Built with TypeScript Express + Streamlit")
