from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TaskMasterBase(BaseModel):
    name: str
    description: Optional[str] = None
    targetAge: Optional[int] = None
    difficulty: int
    points: int
    timeEstimate: Optional[int] = None


class TaskMasterCreate(TaskMasterBase):
    pass


class TaskMasterResponse(TaskMasterBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    taskMasterId: str
    userId: str
    isCompleted: bool = False
    isVerified: bool = False
    points: int


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    isCompleted: Optional[bool] = None
    isVerified: Optional[bool] = None
    completedAt: Optional[datetime] = None


class TaskResponse(TaskBase):
    id: str
    completedAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
    taskMaster: TaskMasterResponse

    class Config:
        from_attributes = True
