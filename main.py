from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.websockets import WebSocket, WebSocketDisconnect

import asyncio
import uvicorn
import openai
import yaml


app = FastAPI()
app.mount("/statics", StaticFiles(directory="statics"), name="statics")
templates = Jinja2Templates(directory="templates")


with open("config.yaml") as f:
    config = yaml.load(f, Loader=yaml.FullLoader)


def get_gpt(message):
    openai.api_key = config["SECRET_KEY"]["GPT"]
    result = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": message},
        ]
    )
    return result['choices'][0]['message']['content'].replace('\n', '')


@app.get('/', response_class=HTMLResponse)
async def main(request: Request):
    context = {
        'request': request
    }
    return templates.TemplateResponse("main.html", context)


@app.post('/', response_class=HTMLResponse)
async def gpt_post(request: Request, message: str = Form(...)):
    async with WebSocket.connect("ws://localhost:8000/ws") as websocket:
        await websocket.send_text(message)
        output_text = await websocket.receive_text()
    return output_text


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            result = get_gpt(data)
            await websocket.send_text(result)
    except WebSocketDisconnect:
        await websocket.close()


if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, workers=1, reload=True)
