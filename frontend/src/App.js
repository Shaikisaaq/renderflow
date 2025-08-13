import React, { useState, useEffect } from 'react';
import { Send, Server, Users, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Backend URL for local development
  const API_BASE = 'http://localhost:5000';

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
    fetchTodos();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        setConnectionStatus('connected');
        console.log('✅ Connected to Flask backend');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('❌ Backend connection failed:', error);
    }
  };

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/todos`);
      if (res.ok) {
        const data = await res.json();
        setTodos(data.todos || []);
        console.log(`📋 Fetched ${data.todos?.length || 0} todos`);
      } else {
        console.error('Failed to fetch todos');
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      console.log('📤 Sending message:', message);
      
      const res = await fetch(`${API_BASE}/api/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: message.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setResponse(data.response);
        console.log('✅ Message sent successfully');
        setMessage(''); // Clear input after successful send
      } else {
        setResponse(`Error: ${data.error || 'Failed to send message'}`);
        console.error('❌ Message send failed:', data.error);
      }
    } catch (error) {
      setResponse('❌ Error: Unable to connect to backend. Make sure Flask server is running on http://localhost:5000');
      console.error('Network error:', error);
    }
    
    setLoading(false);
  };



  
  const addTodo = async () => {
    const todoText = newTodo.trim();
    if (!todoText) return;
    
    try {
      console.log('📝 Adding todo:', todoText);
      
      const res = await fetch(`${API_BASE}/api/todos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ text: todoText })
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Todo added successfully');
        setNewTodo('');
        fetchTodos(); // Refresh the list
      } else {
        const data = await res.json();
        console.error('❌ Failed to add todo:', data.error);
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      console.log('🗑️ Deleting todo:', id);
      
      const res = await fetch(`${API_BASE}/api/todos/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      
      if (res.ok) {
        console.log('✅ Todo deleted successfully');
        fetchTodos(); // Refresh the list
      } else {
        const data = await res.json();
        console.error('❌ Failed to delete todo:', data.error);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Server className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-white">React + Flask App</h1>
          </div>
          <p className="text-gray-300 text-lg">Local Development Environment</p>
          
          {/* Connection Status */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm">
            {connectionStatus === 'connected' ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300">Connected to Flask Backend</span>
              </>
            ) : connectionStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-300">Backend Not Available</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 text-yellow-400 animate-spin" />
                <span className="text-yellow-300">Checking Connection...</span>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Message Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Send Message</h2>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, sendMessage)}
                placeholder="Enter your message..."
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                disabled={loading || connectionStatus !== 'connected'}
              />
              
              <button
                onClick={sendMessage}
                disabled={loading || connectionStatus !== 'connected' || !message.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Activity className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              
              {response && (
                <div className={`mt-4 p-4 rounded-lg ${
                  response.includes('Error') || response.includes('❌') 
                    ? 'bg-red-500/20 border border-red-500/30' 
                    : 'bg-green-500/20 border border-green-500/30'
                }`}>
                  <p className={`font-medium ${
                    response.includes('Error') || response.includes('❌') 
                      ? 'text-red-200' 
                      : 'text-green-200'
                  }`}>
                    {response.includes('Error') || response.includes('❌') ? 'Error:' : 'Response:'}
                  </p>
                  <p className="text-white mt-1">{response}</p>
                </div>
              )}

              {/* Development Info */}
              <div className="text-xs text-gray-400 bg-black/20 rounded-lg p-3">
                <p><strong>Backend:</strong> http://localhost:5000</p>
                <p><strong>Frontend:</strong> http://localhost:3000</p>
                <p><strong>Status:</strong> {connectionStatus}</p>
              </div>
            </div>
          </div>

          {/* Todo Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">
                Todo List ({todos.length})
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addTodo)}
                  placeholder="Add a new todo..."
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  disabled={connectionStatus !== 'connected'}
                />
                <button
                  onClick={addTodo}
                  disabled={connectionStatus !== 'connected' || !newTodo.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {todos.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">No todos yet</p>
                    <p className="text-xs text-gray-500 mt-1">Add one above to get started</p>
                  </div>
                ) : (
                  todos.map((todo, index) => (
                    <div key={todo.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-6">{index + 1}.</span>
                        <span className="text-white">{todo.text}</span>
                      </div>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded text-sm transition-colors duration-200 border border-red-500/30"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>

              {connectionStatus !== 'connected' && (
                <div className="text-center py-4 px-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-200 text-sm">
                    Make sure your Flask backend is running on port 5000
                  </p>
                  <button
                    onClick={checkBackendConnection}
                    className="mt-2 text-xs text-yellow-300 underline hover:text-yellow-200"
                  >
                    Retry Connection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Development Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p className="text-sm">
            🚀 Local Development • 
            React on port 3000 • 
            Flask on port 5000
          </p>
          <p className="text-xs mt-1">
            Check browser console for detailed logs
          </p>
        </div>
      </div>
    </div>
  );
}