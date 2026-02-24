from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Plan(Base):
    __tablename__ = "plans"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    version = Column(Integer, default=1)
    status = Column(String, default="generated") # generated, active, completed, replanned
    ai_raw_prompt = Column(String) # For auditing/replanning context
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    project = relationship("Project", back_populates="plans")
    tasks = relationship("Task", back_populates="plan", cascade="all, delete-orphan")
    costs = relationship("Cost", back_populates="plan", cascade="all, delete-orphan", uselist=False)
