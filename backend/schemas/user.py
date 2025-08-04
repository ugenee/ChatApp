from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True

class MessageCreate(BaseModel):
    recipient: str
    message: str

class MessageOut(BaseModel):
    id: int
    content: str
    timestamp: datetime
    sender_username: str
    recipient_username: str
    model_config = {
        "from_attributes": True
    }