from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os
import json
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)

# Подключение к MongoDB
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client['business_db']  # Используем правильное имя базы данных
collection = db['businesses']  # Возвращаем имя коллекции обратно на 'businesses'

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/send-data/', methods=['POST'])
def send_data():
    try:
        data = request.json.get('data')
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        # Добавляем данные в MongoDB
        result = collection.insert_one(data)
        
        return jsonify({
            'message': 'Data received successfully',
            'id': str(result.inserted_id)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 