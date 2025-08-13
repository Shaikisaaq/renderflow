from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from datetime import datetime

app = Flask(__name__)

# Enable CORS for local development
# CORS(app, origins=["http://localhost:3000"])

# In-memory storage (in production, use a database)
todos = []
messages = []

@app.route('/')
def home():
    return jsonify({
        'message': 'Flask Backend API - Local Development',
        'status': 'running',
        'environment': 'development',
        'endpoints': {
            'POST /api/message': 'Send a message',
            'GET /api/todos': 'Get all todos',
            'POST /api/todos': 'Create a todo',
            'DELETE /api/todos/<id>': 'Delete a todo',
            'GET /api/messages': 'Get all messages',
            'GET /health': 'Health check'
        }
    })

@app.route('/api/message', methods=['POST'])
def handle_message():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Store the message
        message_obj = {
            'id': str(uuid.uuid4()),
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'response': f"Echo: {message}"
        }
        messages.append(message_obj)
        
        # Simple echo response with current time
        current_time = datetime.now().strftime('%H:%M:%S')
        response = f"Hello! You said: '{message}'. Message received at {current_time}"
        
        print(f"[{current_time}] Received message: {message}")  # Debug logging
        
        return jsonify({
            'response': response,
            'message_id': message_obj['id'],
            'timestamp': current_time
        })
    
    except Exception as e:
        print(f"Error in handle_message: {str(e)}")  # Debug logging
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/todos', methods=['GET'])
def get_todos():
    try:
        print(f"Fetching {len(todos)} todos")  # Debug logging
        return jsonify({
            'todos': todos,
            'count': len(todos)
        })
    except Exception as e:
        print(f"Error in get_todos: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/todos', methods=['POST'])
def create_todo():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'Todo text is required'}), 400
        
        todo = {
            'id': str(uuid.uuid4()),
            'text': text,
            'completed': False,
            'created_at': datetime.now().isoformat()
        }
        
        todos.append(todo)
        print(f"Created todo: {text}")  # Debug logging
        
        return jsonify({
            'message': 'Todo created successfully',
            'todo': todo
        }), 201
    
    except Exception as e:
        print(f"Error in create_todo: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/todos/<todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    try:
        global todos
        initial_count = len(todos)
        todos = [todo for todo in todos if todo['id'] != todo_id]
        
        if len(todos) == initial_count:
            return jsonify({'error': 'Todo not found'}), 404
        
        print(f"Deleted todo with id: {todo_id}")  # Debug logging
        
        return jsonify({
            'message': 'Todo deleted successfully',
            'remaining_todos': len(todos)
        })
    
    except Exception as e:
        print(f"Error in delete_todo: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/messages', methods=['GET'])
def get_messages():
    try:
        return jsonify({
            'messages': messages,
            'count': len(messages)
        })
    except Exception as e:
        print(f"Error in get_messages: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'todos_count': len(todos),
        'messages_count': len(messages)
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

# Add some sample data for testing
def init_sample_data():
    """Initialize with some sample data for testing"""
    sample_todos = [
        "Learn React and Flask integration",
        "Set up local development environment",
        "Deploy to Render"
    ]
    
    for todo_text in sample_todos:
        todo = {
            'id': str(uuid.uuid4()),
            'text': todo_text,
            'completed': False,
            'created_at': datetime.now().isoformat()
        }
        todos.append(todo)
    
    print(f"Initialized with {len(sample_todos)} sample todos")

if __name__ == '__main__':
    # Initialize sample data
    init_sample_data()
    
    # # Configuration for local development
    # port = int(os.environ.get('PORT', 5000))
    # debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # print("="*50)
    # print("🚀 Starting Flask Backend Server")
    # print("="*50)
    # print(f"Environment: Development")
    # print(f"Port: {port}")
    # print(f"Debug Mode: {debug_mode}")
    # print(f"Frontend URL: http://localhost:3000")
    # print(f"Backend URL: http://localhost:{port}")
    # print(f"API Base: http://localhost:{port}/api")
    # print("="*50)
    
