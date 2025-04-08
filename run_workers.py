import subprocess
import sys
import os

def run_workers():
    try:
        # Запускаем оба воркера в отдельных процессах
        main_process = subprocess.Popen([sys.executable, 'worker_service/main.py'])
        register_process = subprocess.Popen([sys.executable, 'worker_service/register_worker.py'])
        
        # Ждем завершения процессов
        main_process.wait()
        register_process.wait()
        
    except KeyboardInterrupt:
        print("\nОстановка воркеров...")
        # Корректно завершаем процессы
        main_process.terminate()
        register_process.terminate()
        main_process.wait()
        register_process.wait()
        print("Воркеры остановлены")
    except Exception as e:
        print(f"Ошибка при запуске воркеров: {str(e)}")
        # В случае ошибки также завершаем процессы
        main_process.terminate()
        register_process.terminate()
        main_process.wait()
        register_process.wait()

if __name__ == "__main__":
    run_workers() 