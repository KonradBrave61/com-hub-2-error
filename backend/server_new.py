from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import asyncio
from database import init_database

app = FastAPI(title="Inazuma Eleven API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_database()

# Include routers
from routes import auth, user_teams, community
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(user_teams.router, prefix="/api", tags=["user_teams"])
app.include_router(community.router, prefix="/api/community", tags=["community"])

@app.get("/")
async def root():
    return {"message": "Inazuma Eleven API is running!"}

@app.get("/api/status")
async def status():
    return {"status": "healthy", "service": "inazuma-eleven-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)