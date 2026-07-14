import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.db import users_collection
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_id,
)
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    PreferencesResponse,
    UpdatePreferencesRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest):
    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    user_id = str(uuid.uuid4())
    await users_collection.insert_one(
        {
            "_id": user_id,
            "name": payload.name,
            "email": payload.email,
            "hashed_password": hash_password(payload.password),
        }
    )

    token = create_access_token(user_id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await users_collection.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(user["_id"])
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user_id)):
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(id=user["_id"], name=user["name"], email=user["email"])


@router.get("/preferences", response_model=PreferencesResponse)
async def get_preferences(user_id: str = Depends(get_current_user_id)):
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return PreferencesResponse(
        email_reminders=user.get("email_reminders", False)
    )


@router.put("/preferences", response_model=PreferencesResponse)
async def update_preferences(
    payload: UpdatePreferencesRequest,
    user_id: str = Depends(get_current_user_id),
):
    await users_collection.update_one(
        {"_id": user_id},
        {"$set": {"email_reminders": payload.email_reminders}},
    )
    return PreferencesResponse(email_reminders=payload.email_reminders)