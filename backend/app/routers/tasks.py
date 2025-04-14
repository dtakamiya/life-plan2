from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..schemas.task import TaskMasterCreate, TaskMasterResponse, TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/masters", response_model=TaskMasterResponse)
async def create_task_master(task_master: TaskMasterCreate):
    return {"id": "dummy", "name": task_master.name, "description": task_master.description,
            "targetAge": task_master.targetAge, "difficulty": task_master.difficulty,
            "points": task_master.points, "timeEstimate": task_master.timeEstimate,
            "createdAt": "2023-01-01T00:00:00", "updatedAt": "2023-01-01T00:00:00"}


@router.get("/masters", response_model=List[TaskMasterResponse])
async def get_task_masters():
    return [{"id": "dummy", "name": "Sample Task", "description": "Description",
            "targetAge": 5, "difficulty": 2, "points": 10, "timeEstimate": 15,
            "createdAt": "2023-01-01T00:00:00", "updatedAt": "2023-01-01T00:00:00"}]


@router.post("/", response_model=TaskResponse)
async def create_task(task: TaskCreate):
    return {"id": "dummy", "taskMasterId": task.taskMasterId, "userId": task.userId,
            "isCompleted": task.isCompleted, "isVerified": task.isVerified, "points": task.points,
            "completedAt": None, "createdAt": "2023-01-01T00:00:00", "updatedAt": "2023-01-01T00:00:00",
            "taskMaster": {"id": "dummy", "name": "Sample Task", "description": "Description",
                          "targetAge": 5, "difficulty": 2, "points": 10, "timeEstimate": 15,
                          "createdAt": "2023-01-01T00:00:00", "updatedAt": "2023-01-01T00:00:00"}}
