import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { saveConversation, loadConversation, clearConversation } from '../utils/conversationStorage';

const QuestionPanel = ({ 
  owner, 
  repo, 
  onClose, 
  onAskQuestion,
  projectIndex
}) => {
  const [question, setQuestion] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  // Determine context level
  const hasComprehensiveContext = projectIndex && projectIndex.fullContent && 
    Object.keys(projectIndex.fullContent).length > 0;
  
  const contextInfo = hasComprehensiveContext ? 
    `${projectIndex.summary?.totalFiles || 0} files analyzed` :
    'Limited context available';

  // Load conversation history when component mounts or repo changes
  useEffect(() => {
    const savedConversations = loadConversation(owner, repo);
    setConversations(savedConversations);
  }, [owner, repo]);

  // Save conversation whenever it changes
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversation(owner, repo, conversations);
    }
  }, [conversations, owner, repo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userMessage = { 
      id: Date.now(), 
      type: 'user', 
      content: question, 
      timestamp: new Date() 
    };
    
    const newConversations = [...conversations, userMessage];
    setConversations(newConversations);
    
    const currentQuestion = question;
    setQuestion('');
    setIsAsking(true);

    try {
      const answer = await onAskQuestion(currentQuestion);
      const botMessage = { 
        id: Date.now() + 1,
        type: 'bot', 
        content: answer, 
        timestamp: new Date() 
      };
      setConversations(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1,
        type: 'bot', 
        content: 'Sorry, I encountered an error while processing your question. Please try again.', 
        timestamp: new Date() 
      };
      setConversations(prev => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the conversation history for this repository?')) {
      setConversations([]);
      clearConversation(owner, repo);
    }
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, lineIndex) => {
      if (line.startsWith('```')) return null;
      
      // Handle code blocks
      if (line.includes('`')) {
        return (
          <p key={`line-${lineIndex}`} className="mb-2">
            {line.split('`').map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <code key={`code-${lineIndex}-${partIndex}`} className="bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded text-xs font-mono">
                  {part}
                </code>
              ) : (
                <span key={`text-${lineIndex}-${partIndex}`}>{part}</span>
              )
            )}
          </p>
        );
      }
      
      // Handle bold text
      if (line.includes('**')) {
        return (
          <p key={`bold-line-${lineIndex}`} className="mb-2">
            {line.split('**').map((part, partIndex) => 
              partIndex % 2 === 1 ? (
                <strong key={`bold-${lineIndex}-${partIndex}`} className="font-semibold text-white">{part}</strong>
              ) : (
                <span key={`normal-${lineIndex}-${partIndex}`}>{part}</span>
              )
            )}
          </p>
        );
      }
      
      return line.trim() ? (
        <p key={`paragraph-${lineIndex}`} className="mb-2">{line}</p>
      ) : null;
    }).filter(Boolean);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString();
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  };

  return (
    <div className="w-1/2 border-l border-white/10 bg-slate-900/40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-medium">Ask AI about {owner}/{repo}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {conversations.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Clear conversation history"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Context Status */}
      <div className={`px-4 py-2 border-b border-white/10 ${hasComprehensiveContext ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
        <div className="flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${hasComprehensiveContext ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          <span className={`${hasComprehensiveContext ? 'text-green-400' : 'text-yellow-400'}`}>
            {hasComprehensiveContext ? '🧠 Comprehensive Analysis' : '⚠️ Basic Analysis'}
          </span>
          <span className="text-slate-400">• {contextInfo}</span>
        </div>
        {hasComprehensiveContext && projectIndex && (
          <div className="mt-1 text-xs text-slate-400">
            Found: {projectIndex.summary?.totalFunctions || 0} functions, {projectIndex.summary?.totalClasses || 0} classes, {projectIndex.summary?.languages?.join(', ') || 'multiple languages'}
          </div>
        )}
      </div>

      {/* Conversation Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {conversations.length === 0 ? (
          <div className="text-center text-slate-400 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-3">Ask me anything about this repository!</p>
            
            {hasComprehensiveContext ? (
              <div className="text-left bg-slate-800/30 rounded-lg p-3 text-xs space-y-2">
                <p className="text-green-400 font-medium">✨ Enhanced AI Analysis Available</p>
                <p className="text-slate-400">I can provide detailed insights about:</p>
                <ul className="text-slate-400 space-y-1 ml-4">
                  <li>• Code structure and architecture patterns</li>
                  <li>• Function and class implementations</li>
                  <li>• Configuration files and setup</li>
                  <li>• Dependencies and technology stack</li>
                  <li>• Best practices and code quality</li>
                  <li>• Specific code snippets and logic</li>
                </ul>
                <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                  <p className="text-blue-400 text-xs font-medium">💡 Model Info</p>
                  <p className="text-blue-300 text-xs">Currently using llama3.2:3b (small model)</p>
                  <p className="text-slate-400 text-xs">For best results with large codebases, consider upgrading to llama3.2:7b or llama3.2:11b</p>
                </div>
                <p className="text-slate-500 mt-2">Try asking: "How does this project work?" or "What are the main components?"</p>
              </div>
            ) : (
              <div className="text-left bg-yellow-500/10 rounded-lg p-3 text-xs space-y-2">
                <p className="text-yellow-400 font-medium">⚠️ Limited Analysis Mode</p>
                <p className="text-slate-400">For detailed code analysis, please wait for full project indexing to complete.</p>
                <p className="text-slate-500">I can still provide general repository information.</p>
              </div>
            )}
            
            <p className="text-xs mt-3 text-slate-500">Your conversation history will be saved locally.</p>
          </div>
        ) : (
          <>
            {/* Conversation history indicator */}
            <div className="text-center mb-4">
              <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                {conversations.length} messages in history
              </span>
            </div>
            
            {conversations.map((message) => (
              <div key={`message-${message.id}`} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 ${
                  message.type === 'user' 
                    ? 'bg-purple-500/20 text-purple-100' 
                    : 'bg-slate-800/50 text-slate-300'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    {message.type === 'user' ? (
                      <User className="w-3 h-3" />
                    ) : (
                      <Bot className="w-3 h-3 text-purple-400" />
                    )}
                    <span className="text-xs opacity-75">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    {message.type === 'user' ? (
                      <p>{message.content}</p>
                    ) : (
                      <div>{formatMessage(message.content)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        
        {/* Loading indicator */}
        {isAsking && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 text-slate-300 rounded-lg p-3 max-w-[85%]">
              <div className="flex items-center space-x-2">
                <Bot className="w-3 h-3 text-purple-400" />
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-sm">Analyzing repository...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {conversations.length === 0 && hasComprehensiveContext && (
        <div className="px-4 py-2 border-t border-white/10 bg-slate-800/20">
          <p className="text-xs text-slate-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-1">
            {[
              "How does this project work?",
              "What are the main components?",
              "What's the architecture?",
              "Explain the main functions",
              "What technologies are used?"
            ].map((suggestedQ, idx) => (
              <button
                key={idx}
                onClick={() => setQuestion(suggestedQ)}
                className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 transition-colors"
              >
                {suggestedQ}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about this repository..."
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            disabled={isAsking}
          />
          <button
            type="submit"
            disabled={!question.trim() || isAsking}
            className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Ask about code structure, functionality, patterns, or anything else!
        </p>
      </form>
    </div>
  );
};

export default QuestionPanel;