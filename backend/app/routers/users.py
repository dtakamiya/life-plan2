from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    return {"id": "dummy", "clerkId": user.clerkId, "name": user.name, "userType": user.userType, 
            "age": user.age, "avatarUrl": user.avatarUrl, "parentId": user.parentId, 
            "createdAt": "2023-01-01T00:00:00", "updatedAt": "2023-01-01T00:00:00"}


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    return {"id": user_id, "clerkId": "dummy", "name": "User Name", "userType": "parent", 
            "age": 30, "avatarUrl": None, "parentId": None, 
            "createdAt": "2023-01-01T00:00:00", "updatedAt": "2023-01-01T00:00:00"}
