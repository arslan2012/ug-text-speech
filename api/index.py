from io import BytesIO
from fastapi import Body, FastAPI, File
from .UTTS import Text2Speech, Speech2Text

app = FastAPI()

@app.get("/api/python")
def hello_world():
    return {"message": "Hello World"}

@app.post("/api/t2s")
def t2s(text: str = Body(...)):
    return Text2Speech(text)

@app.post("/api/s2t")
def process_sound(sound: bytes = File(...)):
    return Speech2Text(BytesIO(sound))
