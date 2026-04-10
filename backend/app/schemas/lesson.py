from pydantic import BaseModel
from datetime import datetime


class LessonCategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    cover_url: str | None
    order: int

    model_config = {"from_attributes": True}


class LessonOut(BaseModel):
    id: int
    category_id: int | None
    title: str
    slug: str
    description: str | None
    video_url: str | None
    thumbnail_url: str | None
    duration_seconds: int
    is_free: bool
    required_plan: str
    order: int
    published: bool
    created_at: datetime
    category: LessonCategoryOut | None = None

    model_config = {"from_attributes": True}


class LessonDetail(LessonOut):
    content: str | None


class LessonProgressUpdate(BaseModel):
    progress_seconds: int
    completed: bool = False


class LessonProgressOut(BaseModel):
    lesson_id: int
    completed: bool
    progress_seconds: int
    updated_at: datetime

    model_config = {"from_attributes": True}
