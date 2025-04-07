from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pika
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Монтируем статические файлы
app.mount("/static", StaticFiles(directory="static"), name="static")

# Конфигурация RabbitMQ
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "data_queue")

# Установка соединения с RabbitMQ
def get_rabbitmq_connection():
    credentials = pika.PlainCredentials('guest', 'guest')
    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        credentials=credentials
    )
    return pika.BlockingConnection(parameters)

class DataItem(BaseModel):
    data: dict

@app.get("/")
async def read_root():
    return FileResponse('static/index.html')

@app.post("/send-data/")
async def send_data(item: DataItem):
    try:
        connection = get_rabbitmq_connection()
        channel = connection.channel()
        
        # Создаем очередь, если она не существует
        channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
        
        # Отправляем сообщение в очередь
        channel.basic_publish(
            exchange='',
            routing_key=RABBITMQ_QUEUE,
            body=json.dumps(item.data),
            properties=pika.BasicProperties(
                delivery_mode=2,  # делаем сообщение persistent
            )
        )
        
        connection.close()
        return {"status": "success", "message": "Data sent to queue"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 