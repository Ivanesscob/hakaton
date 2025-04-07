import pika
import json
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime, UTC
from bson import ObjectId

load_dotenv()

# Конфигурация RabbitMQ
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "data_queue")

# Конфигурация MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB = os.getenv("MONGO_DB", "business_db")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "business")
MONGO_COMPANIES_COLLECTION = os.getenv("MONGO_COMPANIES_COLLECTION", "companies")

# Подключение к MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db[MONGO_COLLECTION]
companies_collection = db[MONGO_COMPANIES_COLLECTION]

def process_auth_message(ch, method, properties, body):
    try:
        # Декодируем сообщение
        auth_data = json.loads(body)
        company_name = auth_data.get('company')
        password = auth_data.get('password')
        
        if not company_name or not password:
            raise ValueError("Отсутствует название компании или пароль")
        
        # Проверяем подключение к MongoDB
        try:
            # Проверяем количество компаний в базе
            total_companies = companies_collection.count_documents({})
            print(f"Всего компаний в базе: {total_companies}")
            
            # Выводим все компании для отладки
            all_companies = list(companies_collection.find())
            print("Список всех компаний:")
            for comp in all_companies:
                print(f"Документ компании: {json.dumps(comp, default=str, indent=2, ensure_ascii=False)}")
            
            # Ищем компанию по правильной структуре
            company = companies_collection.find_one({"company.name": company_name})
            print(f"Результат поиска компании: {json.dumps(company, default=str, indent=2, ensure_ascii=False) if company else 'Не найдено'}")
            
            if company:
                company_data = company.get('company', {})
                company_password = company_data.get('password')
                
                if company_password == password:
                    # Получаем все бизнесы компании
                    company_id = company_data.get('_id')
                    if company_id:
                        # Получаем бизнесы из массива businesses внутри документа компании
                        businesses = company.get('businesses', [])
                        print(f"Найдено бизнесов в компании: {len(businesses)}")
                        print("Список найденных бизнесов:")
                        for bus in businesses:
                            print(f"Бизнес: {json.dumps(bus, default=str, indent=2, ensure_ascii=False)}")
                        
                        # Преобразуем ObjectId в строки для JSON и добавляем недостающие поля
                        formatted_businesses = []
                        for business in businesses:
                            formatted_business = {
                                "_id": str(business.get("_id", ObjectId())),
                                "company_id": str(company_id),
                                "name": business.get("name", "Без названия"),
                                "description": business.get("description", ""),
                                "created_at": business.get("created_at", datetime.now(UTC).isoformat()),
                                "products": []
                            }
                            
                            # Преобразуем продукты в правильный формат
                            if "products" in business and isinstance(business["products"], list):
                                formatted_products = []
                                for product in business["products"]:
                                    if isinstance(product, dict):
                                        formatted_products.append({
                                            "name": product.get("name", ""),
                                            "description": product.get("description", ""),
                                            "price": product.get("price", 0),
                                            "created_at": product.get("created_at", datetime.now(UTC).isoformat())
                                        })
                                formatted_business["products"] = formatted_products
                            
                            formatted_businesses.append(formatted_business)
                        
                        response = {
                            "status": "success",
                            "company": {
                                "id": str(company_id),
                                "name": company_data.get('name', 'Без названия'),
                                "email": company_data.get('email', ''),
                                "created_at": company_data.get('created_at', '')
                            },
                            "businesses": formatted_businesses
                        }
                        
                        # Выводим полный JSON ответа
                        print("Полный JSON ответа:")
                        print(json.dumps(response, indent=2, ensure_ascii=False))
                    else:
                        response = {
                            "status": "error",
                            "message": "Ошибка данных компании"
                        }
                else:
                    response = {
                        "status": "error",
                        "message": "Компания не найдена или неверный пароль"
                    }
            else:
                response = {
                    "status": "error",
                    "message": "Компания не найдена или неверный пароль"
                }
        except Exception as e:
            print(f"Ошибка при работе с MongoDB: {str(e)}")
            raise
        
        # Проверяем наличие очереди для ответа
        if not properties.reply_to:
            raise ValueError("Отсутствует очередь для ответа")
        
        # Отправляем ответ в очередь ответов
        ch.basic_publish(
            exchange='',
            routing_key=properties.reply_to,
            body=json.dumps(response)
        )
        
        # Подтверждаем обработку сообщения
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f"Error processing auth message: {str(e)}")
        # В случае ошибки, отправляем сообщение об ошибке
        error_response = {
            "status": "error",
            "message": f"Внутренняя ошибка сервера: {str(e)}"
        }
        if properties.reply_to:
            ch.basic_publish(
                exchange='',
                routing_key=properties.reply_to,
                body=json.dumps(error_response)
            )
        ch.basic_ack(delivery_tag=method.delivery_tag)

def process_message(ch, method, properties, body):
    try:
        # Декодируем сообщение
        data = json.loads(body)
        
        # Добавляем timestamp к данным
        data['timestamp'] = datetime.now(UTC)
        
        # Сохраняем данные в MongoDB
        result = collection.insert_one(data)
        
        # Подтверждаем обработку сообщения
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
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
    
    # Объявляем очереди
    channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
    channel.queue_declare(queue="auth_queue", durable=True)
    channel.queue_declare(queue="auth_response_queue", durable=True)
    
    # Устанавливаем prefetch count
    channel.basic_qos(prefetch_count=1)
    
    # Начинаем прослушивать очереди
    channel.basic_consume(
        queue=RABBITMQ_QUEUE,
        on_message_callback=process_message
    )
    
    channel.basic_consume(
        queue="auth_queue",
        on_message_callback=process_auth_message
    )
    
    channel.start_consuming()

if __name__ == "__main__":
    main() 