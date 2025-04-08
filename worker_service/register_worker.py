import pika
import json
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

load_dotenv()

# Конфигурация RabbitMQ
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")

# Конфигурация MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB = os.getenv("MONGO_DB", "business_db")
MONGO_COMPANIES_COLLECTION = os.getenv("MONGO_COMPANIES_COLLECTION", "companies")

# Подключение к MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
companies_collection = db[MONGO_COMPANIES_COLLECTION]


def process_register_message(ch, method, properties, body):
    try:
        # Декодируем сообщение
        register_data = json.loads(body)
        company_name = register_data.get('company')
        email = register_data.get('email')
        password = register_data.get('password')

        print(f"Получены данные для регистрации: company={company_name}, email={email}, password={password}")

        if not company_name or not email or not password:
            raise ValueError("Отсутствует название компании, email или пароль")

        # Проверяем подключение к MongoDB
        try:
            # Проверяем, существует ли компания
            print("Проверка уникальности компании...")
            existing_company = companies_collection.find_one({"company.name": company_name})
            if existing_company:
                print(f"Компания {company_name} уже существует: {json.dumps(existing_company, default=str, indent=2)}")
                response = {
                    "status": "error",
                    "message": "Компания с таким названием уже существует"
                }
            elif companies_collection.find_one({"company.email": email}):
                print(f"Email {email} уже зарегистрирован")
                response = {
                    "status": "error",
                    "message": "Email уже зарегистрирован"
                }
            else:
                # Создаем новую компанию с правильной структурой
                company_data = {
                    "_id": ObjectId(),
                    "company": {
                        "_id": str(ObjectId()),
                        "name": company_name,
                        "password": password,  # В реальном приложении нужно хешировать пароль
                        "email": email,
                        "created_at": datetime.utcnow().isoformat() + "Z"
                    },
                    "businesses": []
                }

                # Сохраняем в MongoDB
                print(f"Добавление компании в {MONGO_DB}.companies: {json.dumps(company_data, default=str, indent=2)}")
                result = companies_collection.insert_one(company_data)

                if not result.inserted_id:
                    print("Не удалось добавить компанию в базу данных")
                    response = {
                        "status": "error",
                        "message": "Не удалось создать компанию"
                    }
                else:
                    print(f"Компания успешно добавлена с ID: {result.inserted_id}")
                    response = {
                        "status": "success",
                        "message": "Компания успешно зарегистрирована",
                        "company": {
                            "id": company_data["company"]["_id"],
                            "name": company_data["company"]["name"],
                            "email": company_data["company"]["email"],
                            "created_at": company_data["company"]["created_at"]
                        }
                    }
        except Exception as e:
            print(f"Ошибка при работе с MongoDB: {str(e)}")
            raise

        # Проверяем наличие очереди для ответа
        if not properties.reply_to:
            raise ValueError("Отсутствует очередь для ответа")

        # Отправляем ответ в очередь ответов
        print(f"Отправка ответа: {json.dumps(response, indent=2)}")
        ch.basic_publish(
            exchange='',
            routing_key=properties.reply_to,
            body=json.dumps(response),
            properties=pika.BasicProperties(delivery_mode=2)
        )

        # Подтверждаем обработку сообщения
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print(f"Error processing register message: {str(e)}")
        # В случае ошибки, отправляем сообщение об ошибке
        error_response = {
            "status": "error",
            "message": f"Внутренняя ошибка сервера: {str(e)}"
        }
        if properties.reply_to:
            ch.basic_publish(
                exchange='',
                routing_key=properties.reply_to,
                body=json.dumps(error_response),
                properties=pika.BasicProperties(delivery_mode=2)
            )
        ch.basic_ack(delivery_tag=method.delivery_tag)


def main():
    # Устанавливаем соединение с RabbitMQ
    credentials = pika.PlainCredentials('guest', 'guest')
    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        credentials=credentials
    )

    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()

    # Объявляем очереди
    channel.queue_declare(queue="register_queue", durable=True)
    channel.queue_declare(queue="register_response_queue", durable=True)

    # Устанавливаем prefetch count
    channel.basic_qos(prefetch_count=1)

    # Начинаем прослушивать очередь
    channel.basic_consume(
        queue="register_queue",
        on_message_callback=process_register_message
    )

    print("Register worker started. Waiting for messages...")
    channel.start_consuming()


if __name__ == "__main__":
    main()