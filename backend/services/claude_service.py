"""
Claude Service
===============
Handles all interactions with the Anthropic Claude API.
Provides structured methods for plan generation, cost estimation,
chatbot responses, and replanning.

Usage:
    from services.claude_service import ClaudeService
    service = ClaudeService()
    plan = await service.generate_plan("2-story residential building...")
"""

import json
import os
from typing import Dict, Any, Optional, List


class ClaudeService:
    """
    Service layer for Anthropic Claude API interactions.
    Uses mock responses when no API key is configured.
    """

    def __init__(self):
        self.api_key = os.environ.get("ANTHROPIC_API_KEY")
        self.client = None
        if self.api_key:
            try:
                from anthropic import Anthropic
                self.client = Anthropic(api_key=self.api_key)
            except ImportError:
                print("WARNING: anthropic package not installed. Using mock responses.")

    def _is_live(self) -> bool:
        return self.client is not None

    async def generate_plan(
        self,
        description: str,
        project_type: str = "residential",
        location: str = "General",
        budget: Optional[float] = None,
        timeline: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate a structured construction plan from a natural language prompt."""

        system_prompt = """You are an expert construction project planner. Generate a detailed, structured construction plan in JSON format.

The JSON must have this exact structure:
{
  "project_name": "string",
  "project_type": "string",
  "summary": "Brief 2-sentence summary",
  "estimated_duration_months": number,
  "phases": [
    {
      "name": "Phase Name",
      "order": 1,
      "duration_weeks": number,
      "description": "What happens in this phase",
      "tasks": [
        {
          "title": "Task name",
          "description": "Task details",
          "duration_days": number,
          "dependencies": ["Other task title if any"],
          "resources": ["Labor type or equipment needed"],
          "is_critical_path": true/false
        }
      ]
    }
  ],
  "milestones": [
    { "name": "Milestone name", "phase": "Phase Name", "description": "What it marks" }
  ],
  "resource_summary": {
    "labor": ["List of labor types needed"],
    "equipment": ["List of equipment needed"],
    "key_materials": ["List of primary materials"]
  }
}

Be realistic with timelines and include all standard construction phases. Respond ONLY with valid JSON, no markdown."""

        user_prompt = f"""Generate a construction plan for:
Description: {description}
Project Type: {project_type}
Location: {location}
{"Budget: $" + f"{budget:,.0f}" if budget else "Budget: Not specified"}
{"Timeline Constraint: " + timeline if timeline else "Timeline: Flexible"}"""

        if self._is_live():
            try:
                message = self.client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=4096,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}],
                )
                return json.loads(message.content[0].text)
            except Exception as e:
                print(f"Claude API error: {e}")
                return self._mock_plan(description, project_type)
        else:
            return self._mock_plan(description, project_type)

    async def estimate_costs(
        self, plan: Dict[str, Any], location: str = "General", quality: str = "standard"
    ) -> Dict[str, Any]:
        """Generate cost estimates for a construction plan."""

        system_prompt = """You are a construction cost estimation expert. Given a construction plan, provide detailed cost estimates in JSON format.

Return this exact JSON structure:
{
  "total_estimated_cost": number,
  "range_low": number,
  "range_high": number,
  "currency": "INR",
  "breakdown": {
    "materials": { "total": number, "items": [{"name": "string", "cost": number, "quantity": "string"}] },
    "labor": { "total": number, "items": [{"role": "string", "rate_per_day": number, "days": number, "cost": number}] },
    "equipment": { "total": number, "items": [{"name": "string", "cost": number, "duration": "string"}] },
    "permits": { "total": number, "items": [{"name": "string", "cost": number}] },
    "overhead": { "total": number, "percentage": number }
  },
  "cost_per_sqft": number,
  "contingency_percentage": 10
}

Be realistic with current market pricing. Respond ONLY with valid JSON."""

        user_prompt = f"""Estimate costs for this construction plan:
{json.dumps(plan, indent=2)}

Location: {location}
Material Quality: {quality}"""

        if self._is_live():
            try:
                message = self.client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=4096,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}],
                )
                return json.loads(message.content[0].text)
            except Exception as e:
                print(f"Claude API error: {e}")
                return self._mock_costs()
        else:
            return self._mock_costs()

    async def chat(
        self, message: str, context: Optional[Dict[str, Any]] = None, history: Optional[List[Dict]] = None
    ) -> str:
        """Get a chatbot response for construction-related queries."""

        system_prompt = """You are BuildWise AI, a helpful construction planning assistant. You help users understand their construction plans, costs, schedules, and answer any construction-related questions.

Be concise, professional, and helpful. If you have project context, reference specific details from their plan."""

        if context:
            system_prompt += f"\n\nCurrent project context:\n{json.dumps(context, indent=2)}"

        messages = []
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": message})

        if self._is_live():
            try:
                response = self.client.messages.create(
                    model="claude-haiku-4-20250514",
                    max_tokens=1024,
                    system=system_prompt,
                    messages=messages,
                )
                return response.content[0].text
            except Exception as e:
                return f"I'm having trouble connecting right now. Error: {str(e)}"
        else:
            return self._mock_chat(message)

    # ── Mock responses for development without API key ──

    def _mock_plan(self, description: str, project_type: str) -> Dict[str, Any]:
        return {
            "project_name": f"{project_type.title()} Construction Project",
            "project_type": project_type,
            "summary": f"A {project_type} construction project based on: {description[:80]}. This plan covers all phases from site preparation through final inspection.",
            "estimated_duration_months": 8,
            "phases": [
                {
                    "name": "Site Preparation",
                    "order": 1,
                    "duration_weeks": 3,
                    "description": "Clear the site, set up temporary facilities, and prepare for construction.",
                    "tasks": [
                        {"title": "Site Survey & Staking", "description": "Survey boundaries and mark building footprint", "duration_days": 3, "dependencies": [], "resources": ["Surveyor", "Survey Equipment"], "is_critical_path": True},
                        {"title": "Demolition & Clearing", "description": "Remove existing structures and vegetation", "duration_days": 5, "dependencies": ["Site Survey & Staking"], "resources": ["Excavator", "Laborers"], "is_critical_path": True},
                        {"title": "Temporary Facilities", "description": "Set up construction office, portable toilets, fencing", "duration_days": 2, "dependencies": [], "resources": ["Laborers"], "is_critical_path": False},
                    ],
                },
                {
                    "name": "Foundation",
                    "order": 2,
                    "duration_weeks": 4,
                    "description": "Excavation, footings, and foundation walls.",
                    "tasks": [
                        {"title": "Excavation", "description": "Dig trenches for footings and foundation", "duration_days": 5, "dependencies": ["Demolition & Clearing"], "resources": ["Excavator", "Dump Truck"], "is_critical_path": True},
                        {"title": "Footings", "description": "Pour concrete footings", "duration_days": 3, "dependencies": ["Excavation"], "resources": ["Concrete Crew", "Concrete Mixer"], "is_critical_path": True},
                        {"title": "Foundation Walls", "description": "Build and pour foundation walls", "duration_days": 7, "dependencies": ["Footings"], "resources": ["Concrete Crew", "Forms"], "is_critical_path": True},
                        {"title": "Waterproofing", "description": "Apply waterproofing membrane to foundation", "duration_days": 2, "dependencies": ["Foundation Walls"], "resources": ["Waterproofing Crew"], "is_critical_path": False},
                        {"title": "Backfill", "description": "Backfill around foundation", "duration_days": 2, "dependencies": ["Waterproofing"], "resources": ["Excavator"], "is_critical_path": False},
                    ],
                },
                {
                    "name": "Framing",
                    "order": 3,
                    "duration_weeks": 5,
                    "description": "Structural framing including walls, floors, and roof.",
                    "tasks": [
                        {"title": "Floor Framing", "description": "Install floor joists and subfloor", "duration_days": 5, "dependencies": ["Foundation Walls"], "resources": ["Framing Crew", "Lumber"], "is_critical_path": True},
                        {"title": "Wall Framing", "description": "Frame exterior and interior walls", "duration_days": 10, "dependencies": ["Floor Framing"], "resources": ["Framing Crew", "Lumber"], "is_critical_path": True},
                        {"title": "Roof Framing", "description": "Install roof trusses and sheathing", "duration_days": 7, "dependencies": ["Wall Framing"], "resources": ["Framing Crew", "Crane"], "is_critical_path": True},
                        {"title": "Window & Door Openings", "description": "Frame out all openings", "duration_days": 3, "dependencies": ["Wall Framing"], "resources": ["Framing Crew"], "is_critical_path": False},
                    ],
                },
                {
                    "name": "Mechanical, Electrical & Plumbing",
                    "order": 4,
                    "duration_weeks": 4,
                    "description": "Rough-in for all building systems.",
                    "tasks": [
                        {"title": "Electrical Rough-In", "description": "Run wiring, install boxes and panels", "duration_days": 8, "dependencies": ["Wall Framing"], "resources": ["Electricians"], "is_critical_path": False},
                        {"title": "Plumbing Rough-In", "description": "Install pipes, drains, and vents", "duration_days": 8, "dependencies": ["Wall Framing"], "resources": ["Plumbers"], "is_critical_path": False},
                        {"title": "HVAC Installation", "description": "Install ductwork and HVAC units", "duration_days": 6, "dependencies": ["Roof Framing"], "resources": ["HVAC Technicians"], "is_critical_path": False},
                        {"title": "Inspections", "description": "Schedule and pass rough-in inspections", "duration_days": 3, "dependencies": ["Electrical Rough-In", "Plumbing Rough-In", "HVAC Installation"], "resources": ["Inspector"], "is_critical_path": True},
                    ],
                },
                {
                    "name": "Interior & Exterior Finishes",
                    "order": 5,
                    "duration_weeks": 8,
                    "description": "All finish work including drywall, paint, flooring, and exterior.",
                    "tasks": [
                        {"title": "Insulation", "description": "Install wall and ceiling insulation", "duration_days": 4, "dependencies": ["Inspections"], "resources": ["Insulation Crew"], "is_critical_path": True},
                        {"title": "Drywall", "description": "Hang, tape, and mud drywall", "duration_days": 10, "dependencies": ["Insulation"], "resources": ["Drywall Crew"], "is_critical_path": True},
                        {"title": "Interior Paint", "description": "Prime and paint all interior surfaces", "duration_days": 7, "dependencies": ["Drywall"], "resources": ["Painters"], "is_critical_path": True},
                        {"title": "Flooring", "description": "Install all floor finishes", "duration_days": 7, "dependencies": ["Interior Paint"], "resources": ["Flooring Crew"], "is_critical_path": True},
                        {"title": "Exterior Siding", "description": "Install siding and exterior trim", "duration_days": 10, "dependencies": ["Roof Framing"], "resources": ["Siding Crew"], "is_critical_path": False},
                        {"title": "Roofing", "description": "Install shingles and flashing", "duration_days": 5, "dependencies": ["Roof Framing"], "resources": ["Roofers"], "is_critical_path": False},
                    ],
                },
                {
                    "name": "Final Phase",
                    "order": 6,
                    "duration_weeks": 3,
                    "description": "Final installations, cleanup, and inspections.",
                    "tasks": [
                        {"title": "Fixture Installation", "description": "Install light fixtures, outlets, plumbing fixtures", "duration_days": 5, "dependencies": ["Interior Paint"], "resources": ["Electricians", "Plumbers"], "is_critical_path": True},
                        {"title": "Cabinets & Countertops", "description": "Install kitchen and bathroom cabinets", "duration_days": 5, "dependencies": ["Flooring"], "resources": ["Cabinet Installers"], "is_critical_path": True},
                        {"title": "Landscaping", "description": "Grade, seed, and plant landscaping", "duration_days": 5, "dependencies": ["Exterior Siding"], "resources": ["Landscaping Crew"], "is_critical_path": False},
                        {"title": "Final Cleanup", "description": "Deep clean entire property", "duration_days": 2, "dependencies": ["Cabinets & Countertops", "Landscaping"], "resources": ["Cleaning Crew"], "is_critical_path": True},
                        {"title": "Final Inspection", "description": "Schedule and pass final building inspection", "duration_days": 2, "dependencies": ["Final Cleanup"], "resources": ["Inspector"], "is_critical_path": True},
                    ],
                },
            ],
            "milestones": [
                {"name": "Foundation Complete", "phase": "Foundation", "description": "Foundation walls poured and cured"},
                {"name": "Dried In", "phase": "Framing", "description": "Building is weather-tight with roof and windows"},
                {"name": "Rough-In Complete", "phase": "Mechanical, Electrical & Plumbing", "description": "All systems roughed in and inspected"},
                {"name": "Certificate of Occupancy", "phase": "Final Phase", "description": "Building passes final inspection"},
            ],
            "resource_summary": {
                "labor": ["Site Surveyor", "General Laborers", "Concrete Crew", "Framing Crew", "Electricians", "Plumbers", "HVAC Technicians", "Drywall Crew", "Painters", "Flooring Crew", "Roofers"],
                "equipment": ["Excavator", "Dump Truck", "Concrete Mixer", "Crane", "Scaffolding"],
                "key_materials": ["Concrete", "Lumber", "Roofing Shingles", "Drywall", "Insulation", "Electrical Wire", "Plumbing Pipe", "Paint", "Flooring"],
            },
        }

    def _mock_costs(self) -> Dict[str, Any]:
        return {
            "total_estimated_cost": 22800000,
            "range_low": 19380000,
            "range_high": 26220000,
            "currency": "INR",
            "breakdown": {
                "materials": {"total": 9120000, "items": [
                    {"name": "Concrete & Foundation", "cost": 1440000, "quantity": "45 cubic yards"},
                    {"name": "Lumber & Framing", "cost": 2560000, "quantity": "12,000 board feet"},
                    {"name": "Roofing Materials", "cost": 680000, "quantity": "30 squares"},
                    {"name": "Electrical Materials", "cost": 960000, "quantity": "Full system"},
                    {"name": "Plumbing Materials", "cost": 760000, "quantity": "Full system"},
                    {"name": "HVAC System", "cost": 880000, "quantity": "1 system"},
                    {"name": "Drywall & Insulation", "cost": 640000, "quantity": "200 sheets"},
                    {"name": "Flooring", "cost": 600000, "quantity": "2,500 sq ft"},
                    {"name": "Cabinets & Countertops", "cost": 600000, "quantity": "Kitchen + 2 baths"},
                ]},
                "labor": {"total": 9576000, "items": [
                    {"role": "General Laborers", "rate_per_day": 16000, "days": 120, "cost": 1920000},
                    {"role": "Framing Crew (4)", "rate_per_day": 28000, "days": 25, "cost": 2800000},
                    {"role": "Electricians", "rate_per_day": 36000, "days": 15, "cost": 540000},
                    {"role": "Plumbers", "rate_per_day": 32000, "days": 15, "cost": 480000},
                    {"role": "HVAC Technicians", "rate_per_day": 32000, "days": 10, "cost": 320000},
                    {"role": "Concrete Crew", "rate_per_day": 40000, "days": 10, "cost": 400000},
                    {"role": "Finish Crews", "rate_per_day": 24000, "days": 40, "cost": 960000},
                    {"role": "Project Manager", "rate_per_day": 36000, "days": 60, "cost": 2160000},
                ]},
                "equipment": {"total": 1824000, "items": [
                    {"name": "Excavator Rental", "cost": 640000, "duration": "2 weeks"},
                    {"name": "Crane Rental", "cost": 480000, "duration": "1 week"},
                    {"name": "Scaffolding", "cost": 280000, "duration": "6 weeks"},
                    {"name": "Dump Truck", "cost": 240000, "duration": "2 weeks"},
                    {"name": "Small Tools & Equipment", "cost": 184000, "duration": "Duration"},
                ]},
                "permits": {"total": 440000, "items": [
                    {"name": "Building Permit", "cost": 240000},
                    {"name": "Electrical Permit", "cost": 64000},
                    {"name": "Plumbing Permit", "cost": 56000},
                    {"name": "Grading Permit", "cost": 80000},
                ]},
                "overhead": {"total": 1840000, "percentage": 8},
            },
            "cost_per_sqft": 9120,
            "contingency_percentage": 10,
        }

    def _mock_chat(self, message: str) -> str:
        msg_lower = message.lower()
        if "cost" in msg_lower or "budget" in msg_lower or "price" in msg_lower:
            return "Based on your current plan, the estimated total cost is **₹228 Lakhs** (range: ₹193L–₹262L). The largest cost drivers are labor (42%) and materials (40%). Would you like me to break down any specific category?"
        elif "timeline" in msg_lower or "schedule" in msg_lower or "long" in msg_lower:
            return "Your project is estimated to take **8 months** across 6 phases. The critical path runs through Foundation → Framing → Inspections → Interior Finishes → Final Inspection. Delays in any critical path task will push the completion date."
        elif "material" in msg_lower:
            return "Key materials include concrete (45 cu yd), lumber (12,000 board feet), roofing, electrical/plumbing systems, drywall, and flooring. Material costs total approximately **₹91 Lakhs**. Would you like suggestions for alternative materials to reduce costs?"
        else:
            return f"Thanks for your question! I can help you understand your construction plan, costs, timeline, or materials. Could you be more specific about what you'd like to know?"
