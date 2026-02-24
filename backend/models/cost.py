from sqlalchemy import Column, Integer, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from .base import Base

class Cost(Base):
    """
    Stores the aggregated cost breakdown for a specific plan.
    """
    __tablename__ = "costs"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), unique=True, nullable=False)
    
    total_estimated_cost = Column(Float, nullable=False)
    range_low = Column(Float)
    range_high = Column(Float)
    
    # Storing itemized breakdown as JSON for flexibility in Phase 1
    # Schema: { "materials": X, "labor": Y, "equipment": Z, "permits": A, "overhead": B, "items": [...] }
    breakdown = Column(JSON, nullable=False)
    
    plan = relationship("Plan", back_populates="costs")
