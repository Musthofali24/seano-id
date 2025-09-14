from fastapi import FastAPI

app = FastAPI(
    title = "SEANO Backend"
)

@app.get("/")
def root():
    return { "message": "SEANO Backend is running" }