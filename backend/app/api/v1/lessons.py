from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.lesson import Lesson, LessonCategory, LessonProgress
from app.schemas.lesson import LessonOut, LessonDetail, LessonCategoryOut, LessonProgressUpdate, LessonProgressOut

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/categories", response_model=list[LessonCategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LessonCategory).order_by(LessonCategory.order))
    return result.scalars().all()


@router.get("", response_model=list[LessonOut])
async def list_lessons(
    category_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Lesson).where(Lesson.published == True).options(selectinload(Lesson.category))
    if category_id:
        query = query.where(Lesson.category_id == category_id)
    query = query.order_by(Lesson.order)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{slug}", response_model=LessonDetail)
async def get_lesson(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Lesson)
        .where(Lesson.slug == slug, Lesson.published == True)
        .options(selectinload(Lesson.category))
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Check plan access
    plan_order = {"free": 0, "starter": 1, "pro": 2, "enterprise": 3}
    user_level = plan_order.get(current_user.plan.value, 0)
    required_level = plan_order.get(lesson.required_plan, 1)
    if not lesson.is_free and user_level < required_level:
        raise HTTPException(status_code=403, detail="Upgrade your plan to access this lesson")

    return lesson


@router.post("/{lesson_id}/progress", response_model=LessonProgressOut)
async def update_progress(
    lesson_id: int,
    payload: LessonProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    progress = result.scalar_one_or_none()
    if not progress:
        progress = LessonProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(progress)

    progress.progress_seconds = payload.progress_seconds
    progress.completed = payload.completed
    await db.commit()
    await db.refresh(progress)
    return progress


@router.get("/progress/my", response_model=list[LessonProgressOut])
async def my_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(LessonProgress).where(LessonProgress.user_id == current_user.id)
    )
    return result.scalars().all()
