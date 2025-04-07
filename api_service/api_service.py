from flask import Flask, request, jsonify
from flask_cors import CORS
import pika
import json
import os
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

app = Flask(__name__)
CORS(app)

# Подключение к RabbitMQ
connection = pika.BlockingConnection(
    pika.ConnectionParameters(host=os.getenv('RABBITMQ_HOST', 'localhost'))
)
channel = connection.channel()

# Объявление очереди
channel.queue_declare(queue=os.getenv('RABBITMQ_QUEUE', 'data_queue'))

@app.route('/send-data/', methods=['POST'])
def send_data():
    try:
        data = request.json.get('data')
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Отправляем данные в RabbitMQ
        channel.basic_publish(
            exchange='',
            routing_key=os.getenv('RABBITMQ_QUEUE', 'data_queue'),
            body=json.dumps(data)
        )
        
        return jsonify({
            'message': 'Data sent to queue successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 