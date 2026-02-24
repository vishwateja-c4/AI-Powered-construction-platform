from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Date
from sqlalchemy.orm import relationship
from .base import Base

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    
    # Task Details
    title = Column(String, nullable=False)
    description = Column(String)
    phase = Column(String, nullable=False) # e.g. "Foundation", "Framing"
    
    # Scheduling
    start_date = Column(Date)
    end_date = Column(Date)
    duration_days = Column(Integer)
    
    # Progress
    status = Column(String, default="pending") # pending, in_progress, completed, delayed
    progress_percentage = Column(Integer, default=0)
    is_critical_path = Column(Boolean, default=False)
    
    # Relationships
    plan = relationship("Plan", back_populates="tasks")
    
    # Dependencies (Simple parent-child for Phase 1)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    subtasks = relationship("Task")
