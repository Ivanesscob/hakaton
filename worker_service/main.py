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
        print(f"Получен запрос на авторизацию: {body.decode()}")
        
        # Декодируем сообщение
        auth_data = json.loads(body)
        company_name = auth_data.get('company')
        password = auth_data.get('password')
        
        if not company_name or not password:
            raise ValueError("Отсутствует название компании или пароль")
        
        print(f"Поиск компании: {company_name}")
        
        # Проверяем подключение к MongoDB
        try:
            # Проверяем количество компаний в базе
            total_companies = companies_collection.count_documents({})
            print(f"Всего компаний в базе: {total_companies}")
            
            # Выводим все компании для отладки
            all_companies = list(companies_collection.find())
            print("Список всех компаний:")
            for comp in all_companies:
                print(f"Документ компании: {comp}")
                try:
                    company_data = comp.get('company', {})
                    comp_name = company_data.get('name', 'Нет названия')
                    print(f"- {comp_name}")
                except Exception as e:
                    print(f"Ошибка при чтении имени компании: {str(e)}")
            
            # Ищем компанию по правильной структуре
            company = companies_collection.find_one({"company.name": company_name})
            print(f"Результат поиска: {company}")
            
            if company:
                print(f"Структура найденной компании: {company}")
                company_data = company.get('company', {})
                company_password = company_data.get('password')
                
                if company_password == password:
                    print(f"Компания найдена: {company_data.get('name', 'Без названия')}")
                    # Получаем все бизнесы компании
                    company_id = company_data.get('_id')
                    if company_id:
                        print(f"Ищем бизнесы для компании с ID: {company_id}")
                        
                        # Проверяем все бизнесы в коллекции
                        all_businesses = list(collection.find())
                        print(f"Всего бизнесов в коллекции: {len(all_businesses)}")
                        print("Список всех бизнесов:")
                        for bus in all_businesses:
                            print(f"- ID: {bus.get('_id')}, company_id: {bus.get('company_id')}, name: {bus.get('name')}")
                        
                        # Ищем бизнесы по ID компании
                        businesses = list(collection.find({"company_id": str(company_id)}))
                        print(f"Найдено бизнесов для компании: {len(businesses)}")
                        
                        # Если бизнесы не найдены, попробуем создать тестовые данные
                        if not businesses:
                            print("Бизнесы не найдены, создаем тестовые данные")
                            # Создаем тестовый бизнес
                            test_business = {
                                "_id": ObjectId(),
                                "company_id": str(company_id),
                                "name": "Бизнес 1",
                                "description": "Описание первого бизнеса",
                                "created_at": datetime.now(UTC).isoformat(),
                                "products": [
                                    {
                                        "name": "Продукт 1",
                                        "description": "Описание продукта 1",
                                        "price": 100,
                                        "created_at": datetime.now(UTC).isoformat()
                                    },
                                    {
                                        "name": "Продукт 2",
                                        "description": "Описание продукта 2",
                                        "price": 200,
                                        "created_at": datetime.now(UTC).isoformat()
                                    }
                                ]
                            }
                            # Вставляем тестовый бизнес в коллекцию
                            collection.insert_one(test_business)
                            businesses = [test_business]
                            print("Тестовый бизнес создан")
                        
                        # Преобразуем ObjectId в строки для JSON и добавляем недостающие поля
                        for business in businesses:
                            business["_id"] = str(business["_id"])
                            business["company_id"] = str(business["company_id"])
                            
                            # Убедимся, что у бизнеса есть все необходимые поля
                            if "products" not in business:
                                business["products"] = []
                            if "description" not in business:
                                business["description"] = ""
                            if "created_at" not in business:
                                business["created_at"] = datetime.now(UTC).isoformat()
                            
                            # Преобразуем продукты в правильный формат
                            if isinstance(business["products"], list):
                                formatted_products = []
                                for product in business["products"]:
                                    if isinstance(product, dict):
                                        formatted_products.append({
                                            "name": product.get("name", ""),
                                            "description": product.get("description", ""),
                                            "price": product.get("price", 0),
                                            "created_at": product.get("created_at", datetime.now(UTC).isoformat())
                                        })
                                business["products"] = formatted_products
                        
                        response = {
                            "status": "success",
                            "company": {
                                "id": str(company_id),
                                "name": company_data.get('name', 'Без названия'),
                                "email": company_data.get('email', ''),
                                "created_at": company_data.get('created_at', '')
                            },
                            "businesses": businesses
                        }
                        
                        # Подробное логирование ответа
                        print("\n=== Данные для отправки ===")
                        print(f"Статус: {response['status']}")
                        print("\nДанные компании:")
                        print(f"- ID: {response['company']['id']}")
                        print(f"- Название: {response['company']['name']}")
                        print(f"- Email: {response['company']['email']}")
                        print(f"- Дата создания: {response['company']['created_at']}")
                        print("\nБизнесы компании:")
                        for business in response['businesses']:
                            print(f"\nБизнес: {business['name']}")
                            print(f"- ID: {business['_id']}")
                            print(f"- Описание: {business['description']}")
                            print(f"- Дата создания: {business['created_at']}")
                            print("- Продукты:")
                            for product in business['products']:
                                print(f"  * {product['name']}")
                                print(f"    - Описание: {product['description']}")
                                print(f"    - Цена: {product['price']}")
                                print(f"    - Дата создания: {product['created_at']}")
                        print("========================\n")
                        
                        # Выводим полный JSON для проверки
                        print("Полный JSON ответа:")
                        print(json.dumps(response, indent=2, ensure_ascii=False))
                    else:
                        print("Ошибка: у компании отсутствует _id")
                        response = {
                            "status": "error",
                            "message": "Ошибка данных компании"
                        }
                else:
                    print(f"Неверный пароль для компании: {company_data.get('name', 'Без названия')}")
                    response = {
                        "status": "error",
                        "message": "Компания не найдена или неверный пароль"
                    }
            else:
                print(f"Компания не найдена: {company_name}")
                response = {
                    "status": "error",
                    "message": "Компания не найдена или неверный пароль"
                }
        except Exception as e:
            print(f"Ошибка при работе с MongoDB: {str(e)}")
            raise
        
        print(f"Отправка ответа: {json.dumps(response)}")
        
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
    
    print(" [*] Waiting for messages. To exit press CTRL+C")
    channel.start_consuming()

if __name__ == "__main__":
    main() 