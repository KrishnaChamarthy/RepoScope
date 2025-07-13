import React from 'react';
import { Code, Copy, Eye, Brain, Loader2, File } from 'lucide-react';
import ExplanationPanel from './ExplanationPanel';
import QuestionPanel from './QuestionPanel';

const CodeViewer = ({ 
  selectedFile,
  fileContent,
  isExplaining,
  showExplanation,
  explanation,
  onExplainCode,
  onCopyToClipboard,
  onCloseExplanation,
  // New props for Q&A
  owner,
  repo,
  showQuestionPanel,
  onAskQuestion,
  onCloseQuestionPanel
}) => {
  const getLanguage = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return languageMap[ext] || 'text';
  };

  // Calculate the width for code panel based on active panels
  const getCodePanelWidth = () => {
    if (showExplanation && showQuestionPanel) return 'w-1/3'; // Both panels open
    if (showExplanation || showQuestionPanel) return 'w-1/2'; // One panel open
    return 'flex-1'; // No panels open
  };

  if (!selectedFile) {
    return (
      <div className="flex-1 bg-slate-900/30 backdrop-blur-sm flex flex-col">
        {/* Show Q&A panel even when no file is selected */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <File className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-white font-medium mb-2">Select a file to view</h3>
              <p className="text-slate-400 text-sm">Choose a file from the tree to see its content</p>
            </div>
          </div>
          
          {/* Q&A Panel when no file selected */}
          {showQuestionPanel && (
            <QuestionPanel 
              owner={owner}
              repo={repo}
              onClose={onCloseQuestionPanel}
              onAskQuestion={onAskQuestion}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-900/30 backdrop-blur-sm flex flex-col">
      {/* File Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/40">
        <div className="flex items-center space-x-3">
          <Code className="w-5 h-5 text-purple-400" />
          <span className="text-white font-medium text-sm">{selectedFile}</span>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
            {getLanguage(selectedFile)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onExplainCode}
            disabled={isExplaining || !fileContent}
            className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Get AI explanation of this code"
          >
            {isExplaining ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            <span className="text-sm">
              {isExplaining ? 'Explaining...' : 'Explain'}
            </span>
          </button>
          <button
            onClick={onCopyToClipboard}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Eye className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Content */}
        <div className={`${getCodePanelWidth()} bg-slate-950/40 overflow-auto transition-all duration-300`}>
          <pre className="text-sm text-slate-300 font-mono p-6 min-h-full">
            <code className="whitespace-pre-wrap break-words leading-6">
              {fileContent}
            </code>
          </pre>
        </div>

        {/* AI Explanation Panel */}
        {showExplanation && (
          <ExplanationPanel 
            explanation={explanation}
            onClose={onCloseExplanation}
          />
        )}

        {/* Q&A Panel */}
        {showQuestionPanel && (
          <QuestionPanel 
            owner={owner}
            repo={repo}
            onClose={onCloseQuestionPanel}
            onAskQuestion={onAskQuestion}
          />
        )}
      </div>
    </div>
  );
};

export default CodeViewer;