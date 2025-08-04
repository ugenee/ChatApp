import json
from fastapi import APIRouter, FastAPI, Depends, HTTPException, Response
from fastapi import FastAPI, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from db.database import get_db, Base, engine
from db.models import Message, User
from schemas.user import MessageCreate, MessageOut, UserCreate, UserLogin, Token, UserOut
from security import hash_password, verify_password
from jwt import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
)
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
from db.database import SessionLocal


app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cookie setter
def set_auth_cookie(response: Response, access_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # True if HTTPS
    )

@app.post("/register")
def register(user: UserCreate, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        {"sub": new_user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    set_auth_cookie(response, access_token)

    return {
        "msg": "User created",
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/login", response_model=Token)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.username == form_data.username).first()
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": db_user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    set_auth_cookie(response, access_token)

    return Token(access_token=access_token, token_type="bearer")

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"msg": "Logged out"}

@app.get("/me")
def read_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }
router = APIRouter()

@router.get("/users", response_model=list[UserOut])
def get_all_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(User).filter(User.username != current_user.username).all()
app.include_router(router)


@router.post("/messages", response_model=MessageOut)
def save_message(msg: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recipient = db.query(User).filter(User.username == msg.recipient).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    message = Message(
        sender_id=current_user.id,
        recipient_id=recipient.id,
        content=msg.message
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return MessageOut.from_orm(message)

@router.get("/messages/{username}", response_model=list[MessageOut])
def get_conversation(username: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    other_user = db.query(User).filter(User.username == username).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")

    messages = db.query(Message).filter(
        ((Message.sender_id == current_user.id) & (Message.recipient_id == other_user.id)) |
        ((Message.sender_id == other_user.id) & (Message.recipient_id == current_user.id))
    ).order_by(Message.timestamp).all()

    return [MessageOut.from_orm(m) for m in messages]
app.include_router(router, prefix="/api")

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[username] = websocket

    def disconnect(self, username: str):
        self.active_connections.pop(username, None)

    async def send_to_user(self, recipient: str, message: str):
        if recipient in self.active_connections:
            await self.active_connections[recipient].send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str, db: Session = Depends(get_db)):
    await manager.connect(websocket, username)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            recipient_name = payload.get("recipient")
            message_text = payload.get("message")

            # Look up sender and recipient in DB
            sender_user = db.query(User).filter(User.username == username).first()
            recipient_user = db.query(User).filter(User.username == recipient_name).first()

            if not sender_user or not recipient_user:
                continue  # Skip if user not found

            # Save to DB
            message = Message(
                sender_id=sender_user.id,
                recipient_id=recipient_user.id,
                content=message_text
            )
            db.add(message)
            db.commit()
            db.refresh(message)

            response_data = json.dumps({
                "sender": username,
                "recipient": recipient_name,
                "message": message_text,
                "timestamp": message.timestamp.isoformat(),
            })

            await manager.send_to_user(username, response_data)  # echo back to sender
            await manager.send_to_user(recipient_name, response_data)

    except WebSocketDisconnect:
        manager.disconnect(username)