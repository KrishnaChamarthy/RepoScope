import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Settings, MessageCircle, Loader2, Database, Bot } from 'lucide-react';

const PageHeader = ({ 
  owner, 
  repo, 
  onNavigateHome, 
  onNavigateBack, 
  onShowQuestions, 
  isIndexing, 
  projectIndex
}) => {
  const [ollamaStatus, setOllamaStatus] = useState('checking');

  useEffect(() => {
    checkOllamaStatus();
    const interval = setInterval(checkOllamaStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkOllamaStatus = async () => {
    try {
      console.log('Checking Ollama status...'); // Debug log
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Health check response:', data); // Debug log
      setOllamaStatus(data.ollama === 'connected' ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Health check failed:', error); // Debug log
      setOllamaStatus('disconnected');
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 backdrop-blur-sm bg-slate-900/90">
      <div className="flex items-center space-x-4">
        <button
          onClick={onNavigateHome}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Back to Home"
        >
          <Home className="w-5 h-5 text-slate-400" />
        </button>
        <button
          onClick={onNavigateBack}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div className="h-6 w-px bg-white/20"></div>
        <div>
          <h1 className="text-xl font-bold text-white">{owner}/{repo}</h1>
          <div className="flex items-center space-x-2">
            <p className="text-slate-400 text-sm">Repository Files</p>
            {isIndexing && (
              <div className="flex items-center space-x-1 text-xs text-purple-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Indexing project...</span>
              </div>
            )}
            {projectIndex && !isIndexing && (
              <div className="flex items-center space-x-1 text-xs text-green-400">
                <Database className="w-3 h-3" />
                <span>Project indexed ({projectIndex.summary.totalFiles} files)</span>
              </div>
            )}
            {/* Ollama Status */}
            <div className={`flex items-center space-x-1 text-xs ${
              ollamaStatus === 'connected' ? 'text-green-400' : 
              ollamaStatus === 'checking' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              <Bot className="w-3 h-3" />
              <span>AI {ollamaStatus}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button 
          onClick={onShowQuestions}
          className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            ollamaStatus === 'connected' 
              ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
              : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
          }`}
          title={ollamaStatus === 'connected' ? "Ask questions about this repository" : "AI is not connected"}
          disabled={ollamaStatus !== 'connected'}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Ask AI</span>
        </button>
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default PageHeader;