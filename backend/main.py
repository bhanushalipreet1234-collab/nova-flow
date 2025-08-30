from fastapi import FastAPI
from .routes import nodes

app = FastAPI(title="NovaFlow API")

app.include_router(nodes.router)
