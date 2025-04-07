import pika
import json
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime, UTC

load_dotenv()

# Конфигурация RabbitMQ
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "data_queue")

# Конфигурация MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB = os.getenv("MONGO_DB", "business_db")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "business")

# Подключение к MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db[MONGO_COLLECTION]

def process_message(ch, method, properties, body):
    try:
        # Декодируем сообщение
        data = json.loads(body)
        
        # Добавляем timestamp к данным
        data['timestamp'] = datetime.now(UTC)
        
        # Сохраняем данные в MongoDB
        result = collection.insert_one(data)
        
        print(f"Successfully processed and saved data with ID: {result.inserted_id}")
        
        # Подтверждаем обработку сообщения
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f"Error processing message: {str(e)}")
        # В случае ошибки, отклоняем сообщение и возвращаем его в очередь
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def main():
    # Устанавливаем соединение с RabbitMQ
    credentials = pika.PlainCredentials('guest', 'guest')
    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        credentials=credentials
    )
    
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    
    # Объявляем очередь
    channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
    
    # Устанавливаем prefetch count
    channel.basic_qos(prefetch_count=1)
    
    # Начинаем прослушивать очередь
    channel.basic_consume(
        queue=RABBITMQ_QUEUE,
        on_message_callback=process_message
    )
    
    print(" [*] Waiting for messages. To exit press CTRL+C")
    channel.start_consuming()

if __name__ == "__main__":
    main() 