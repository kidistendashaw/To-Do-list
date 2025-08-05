from ninja import Router
from ninja.security import HttpBearer
from typing import List
from .models import Task
from .schemas import TaskSchema, TaskCreateSchema, TaskUpdateSchema, MessageSchema
from django.shortcuts import get_object_or_404
from datetime import date
from django.contrib.auth.models import User


# Define a security scheme for JWT
class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        # Here you would integrate with a real JWT validation library
        # For simplicity, we'll just check if the token is a user ID
        # In a real app, use something like `rest_framework_simplejwt` to decode and verify
        try:
            # This is an INSECURE placeholder. Real JWT logic is needed.
            # The frontend will send the user ID as the "token" for this simple example.
            # Proper implementation requires decoding a real JWT.
            user = User.objects.get(id=int(token))
            return user
        except (User.DoesNotExist, ValueError):
            pass


tasks_router = Router(auth=AuthBearer())


@tasks_router.get("/", response=List[TaskSchema])
def list_tasks(request, status: str = None):
    tasks = Task.objects.filter(owner=request.auth)
    if status:
        tasks = tasks.filter(status=status)
    return tasks


@tasks_router.post("/", response={201: TaskSchema})
def create_task(request, payload: TaskCreateSchema):
    task = Task.objects.create(**payload.dict(), owner=request.auth)
    return 201, task


@tasks_router.put("/{task_id}", response=TaskSchema)
def update_task(request, task_id: int, payload: TaskUpdateSchema):
    task = get_object_or_404(Task, id=task_id, owner=request.auth)
    for attr, value in payload.dict(exclude_unset=True).items():
        if attr == "status" and value == "COMPLETED":
            task.completion_date = date.today()
        elif attr == "status" and value == "IN_PROGRESS":
            task.completion_date = None
        setattr(task, attr, value)
    task.save()
    return task


@tasks_router.delete("/{task_id}", response={204: None})
def delete_task(request, task_id: int):
    task = get_object_or_404(Task, id=task_id, owner=request.auth)
    task.delete()
    return 204, None
