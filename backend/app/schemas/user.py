from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    name: str
    userType: str
    age: Optional[int] = None
    avatarUrl: Optional[str] = None
    parentId: Optional[str] = None


class UserCreate(UserBase):
    clerkId: str


class UserResponse(UserBase):
    id: str
    clerkId: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
