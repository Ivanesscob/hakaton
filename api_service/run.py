import uvicorn
import sys

if __name__ == "__main__":
    try:
        uvicorn.run(
            "main:app",
            host="localhost",
            port=8001,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\nShutting down server...")
        sys.exit(0)
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...")
        sys.exit(1)