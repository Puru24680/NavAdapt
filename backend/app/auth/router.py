from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
import time
from .security import hash_password, verify_password, create_access_token, verify_access_token

router = APIRouter()

# Role permissions mapping
ROLE_METADATA = {
    "Autonomous Systems Engineer": {
        "clearanceLevel": "LEVEL 4 AV PILOT",
        "canControlCAN": True,
        "canEmergencyBrake": True,
        "canModifyParameters": True,
        "avatarIcon": "⚡"
    },
    "Fleet Safety Officer": {
        "clearanceLevel": "FLEET AUDIT LEAD",
        "canControlCAN": False,
        "canEmergencyBrake": True,
        "canModifyParameters": False,
        "avatarIcon": "🛡️"
    },
    "AI Perception Researcher": {
        "clearanceLevel": "PERCEPTION SCIENTIST",
        "canControlCAN": False,
        "canEmergencyBrake": False,
        "canModifyParameters": True,
        "avatarIcon": "🔬"
    },
    "Test Vehicle Pilot": {
        "clearanceLevel": "CERTIFIED TEST PILOT",
        "canControlCAN": True,
        "canEmergencyBrake": True,
        "canModifyParameters": False,
        "avatarIcon": "🚗"
    }
}

# In-memory User Database with pre-seeded, securely hashed accounts
USERS_DB: Dict[str, Dict[str, Any]] = {}

def _seed_users():
    seed_data = [
        {
            "id": "usr-eng-01",
            "name": "Eng. Aarav Sharma",
            "email": "engineer@navadapt.ai",
            "password": "navadapt2026",
            "role": "Autonomous Systems Engineer"
        },
        {
            "id": "usr-safe-02",
            "name": "Priya Patel",
            "email": "safety@navadapt.ai",
            "password": "safety2026",
            "role": "Fleet Safety Officer"
        },
        {
            "id": "usr-res-03",
            "name": "Dr. Vikram Rao",
            "email": "research@navadapt.ai",
            "password": "research2026",
            "role": "AI Perception Researcher"
        }
    ]

    for item in seed_data:
        h = hash_password(item["password"])
        meta = ROLE_METADATA.get(item["role"], ROLE_METADATA["Autonomous Systems Engineer"])
        USERS_DB[item["email"].lower()] = {
            "id": item["id"],
            "name": item["name"],
            "email": item["email"].lower(),
            "salt": h["salt"],
            "password_hash": h["hash"],
            "role": item["role"],
            **meta
        }

_seed_users()

# Pydantic Schemas
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Autonomous Systems Engineer"

class LoginRequest(BaseModel):
    email: str
    password: str

class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    clearanceLevel: str
    canControlCAN: bool
    canEmergencyBrake: bool
    canModifyParameters: bool
    avatarIcon: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    access_token: str
    token_type: str = "Bearer"
    expires_in: int = 86400
    user: UserProfileResponse

# Dependency to extract and verify current user from Authorization header
def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token expired or invalid signature")
    email = payload.get("email")
    if not email or email not in USERS_DB:
        raise HTTPException(status_code=401, detail="User associated with token not found")
    return USERS_DB[email]

@router.post("/register", response_model=AuthResponse)
def register_user(req: RegisterRequest):
    email_clean = req.email.strip().lower()
    if email_clean in USERS_DB:
        raise HTTPException(status_code=400, detail="An operator account with this email already exists")
    
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    
    role = req.role if req.role in ROLE_METADATA else "Autonomous Systems Engineer"
    meta = ROLE_METADATA[role]
    hashed = hash_password(req.password)
    user_id = f"usr-{int(time.time()*1000)}"

    user_record = {
        "id": user_id,
        "name": req.name.strip(),
        "email": email_clean,
        "salt": hashed["salt"],
        "password_hash": hashed["hash"],
        "role": role,
        **meta
    }
    USERS_DB[email_clean] = user_record

    token = create_access_token({
        "sub": user_id,
        "email": email_clean,
        "name": user_record["name"],
        "role": role
    })

    user_profile = UserProfileResponse(
        id=user_id,
        name=user_record["name"],
        email=email_clean,
        role=role,
        clearanceLevel=meta["clearanceLevel"],
        canControlCAN=meta["canControlCAN"],
        canEmergencyBrake=meta["canEmergencyBrake"],
        canModifyParameters=meta["canModifyParameters"],
        avatarIcon=meta["avatarIcon"]
    )

    return AuthResponse(
        success=True,
        message=f"Operator {user_record['name']} registered successfully.",
        access_token=token,
        user=user_profile
    )

@router.post("/login", response_model=AuthResponse)
def login_user(req: LoginRequest):
    email_clean = req.email.strip().lower()
    user = USERS_DB.get(email_clean)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(req.password, user["salt"], user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": user["id"],
        "email": email_clean,
        "name": user["name"],
        "role": user["role"]
    })

    user_profile = UserProfileResponse(
        id=user["id"],
        name=user["name"],
        email=email_clean,
        role=user["role"],
        clearanceLevel=user["clearanceLevel"],
        canControlCAN=user["canControlCAN"],
        canEmergencyBrake=user["canEmergencyBrake"],
        canModifyParameters=user["canModifyParameters"],
        avatarIcon=user["avatarIcon"]
    )

    return AuthResponse(
        success=True,
        message=f"Access granted. Welcome back, {user['name']}.",
        access_token=token,
        user=user_profile
    )

@router.get("/me", response_model=UserProfileResponse)
def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    return UserProfileResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        clearanceLevel=user["clearanceLevel"],
        canControlCAN=user["canControlCAN"],
        canEmergencyBrake=user["canEmergencyBrake"],
        canModifyParameters=user["canModifyParameters"],
        avatarIcon=user["avatarIcon"]
    )

@router.post("/logout")
def logout():
    return {"success": True, "message": "Session invalidated."}
