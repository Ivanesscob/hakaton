from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pika
import json
import os
from dotenv import load_dotenv
import asyncio

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


class LoginData(BaseModel):
    company: str
    password: str


class RegisterData(BaseModel):
    company: str
    email: str
    password: str


@app.get("/")
async def read_root():
    return FileResponse('static/index.html')


@app.get("/panel")
async def read_root():
    return FileResponse('static/panel.html')

@app.get("/profile")
async def read_root():
    return FileResponse('static/companyProfile.html')

@app.get("/auth/register")
async def read_root():
    return FileResponse('static/auth/register.html')


@app.get("/auth/login")
async def read_root():
    return FileResponse('static/auth/login.html')


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


@app.post("/api/auth/login")
async def login(login_data: LoginData):
    try:
        connection = get_rabbitmq_connection()
        channel = connection.channel()

        # Создаем очередь для авторизации, если она не существует
        auth_queue = "auth_queue"
        channel.queue_declare(queue=auth_queue, durable=True)

        # Создаем очередь для ответа
        response_queue = "auth_response_queue"
        channel.queue_declare(queue=response_queue, durable=True)

        # Очищаем очередь ответов перед отправкой нового запроса
        channel.queue_purge(queue=response_queue)

        # Отправляем данные для авторизации
        channel.basic_publish(
            exchange='',
            routing_key=auth_queue,
            body=json.dumps({
                "company": login_data.company,
                "password": login_data.password
            }),
            properties=pika.BasicProperties(
                delivery_mode=2,
                reply_to=response_queue
            )
        )

        # Ждем ответ от worker'а (максимум 5 секунд)
        for _ in range(50):  # 50 попыток по 0.1 секунды = 5 секунд
            method_frame, header_frame, body = channel.basic_get(queue=response_queue)
            if method_frame:
                channel.basic_ack(method_frame.delivery_tag)
                response_data = json.loads(body)
                connection.close()
                return response_data
            await asyncio.sleep(0.1)

        connection.close()
        raise HTTPException(status_code=408, detail="Таймаут ожидания ответа")

    except Exception as e:
        print(f"Ошибка при авторизации: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/auth/register")
async def register(register_data: RegisterData):
    try:
        # Проверяем входные данные
        if not register_data.company or not register_data.email or not register_data.password:
            raise HTTPException(status_code=400, detail="Все поля (company, email, password) обязательны")

        connection = get_rabbitmq_connection()
        channel = connection.channel()

        # Создаем очередь для регистрации
        register_queue = "register_queue"
        channel.queue_declare(queue=register_queue, durable=True)

        # Создаем очередь для ответа
        response_queue = "register_response_queue"
        channel.queue_declare(queue=response_queue, durable=True)

        # Очищаем очередь ответов перед отправкой нового запроса
        channel.queue_purge(queue=response_queue)

        # Отправляем данные для регистрации
        channel.basic_publish(
            exchange='',
            routing_key=register_queue,
            body=json.dumps({
                "company": register_data.company,
                "email": register_data.email,
                "password": register_data.password
            }),
            properties=pika.BasicProperties(
                delivery_mode=2,
                reply_to=response_queue
            )
        )

        # Ждем ответ от worker'а (максимум 5 секунд)
        for _ in range(50):
            method_frame, header_frame, body = channel.basic_get(queue=response_queue)
            if method_frame:
                channel.basic_ack(method_frame.delivery_tag)
                response_data = json.loads(body)
                connection.close()
                return response_data
            await asyncio.sleep(0.1)

        connection.close()
        raise HTTPException(status_code=408, detail="Таймаут ожидания ответа")

    except Exception as e:
        print(f"Ошибка при регистрации: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}