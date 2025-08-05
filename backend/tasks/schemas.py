from ninja import Schema
from datetime import date, datetime
from typing import Optional


# Input Schemas
class TaskCreateSchema(Schema):
    title: str
    deadline: date


class TaskUpdateSchema(Schema):
    title: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = None  # Expects 'IN_PROGRESS' or 'COMPLETED'


class UserRegisterSchema(Schema):
    username: str  # In our case, this will be the email
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class PasswordResetRequestSchema(Schema):
    email: str


class PasswordResetConfirmSchema(Schema):
    new_password1: str
    new_password2: str


# Output Schemas
class TaskSchema(Schema):
    id: int
    title: str
    deadline: date
    status: str
    completion_date: Optional[date]
    created_at: datetime
    updated_at: datetime


class UserSchema(Schema):
    id: int
    username: str
    first_name: str
    last_name: str


class MessageSchema(Schema):
    message: str
