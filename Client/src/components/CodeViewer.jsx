import React, { useEffect, useRef } from 'react';
import { Code, Copy, Eye, Brain, Loader2, File } from 'lucide-react';
import ExplanationPanel from './ExplanationPanel';
import QuestionPanel from './QuestionPanel';
import Prism from 'prismjs';

import 'prismjs/themes/prism-tomorrow.css';

// Import only the most basic, stable languages
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';

// TypeScript requires JavaScript as dependency
import 'prismjs/components/prism-typescript';

// Line numbers plugin
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';

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
  onCloseQuestionPanel,
  projectIndex
}) => {
  const getLanguage = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const languageMap = {
      // JavaScript family
      'js': 'javascript',
      'mjs': 'javascript',
      'cjs': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      
      // Python
      'py': 'python',
      'pyw': 'python',
      'pyi': 'python',
      
      // Web Technologies
      'html': 'markup',
      'htm': 'markup',
      'xml': 'markup',
      'svg': 'markup',
      'css': 'css',
      'scss': 'css',
      'sass': 'css',
      'less': 'css',
      
      // Java & JVM Languages (use java for all)
      'java': 'java',
      'kt': 'java',
      'scala': 'java',
      'groovy': 'java',
      
      // C family
      'c': 'c',
      'cpp': 'c', // Use 'c' instead of 'cpp' to avoid dependency issues
      'cc': 'c',
      'cxx': 'c',
      'h': 'c',
      'hpp': 'c',
      'hh': 'c',
      'hxx': 'c',
      'cs': 'c', // Use 'c' for C# to avoid issues
      
      // Shell Scripts
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'fish': 'bash',
      'ps1': 'bash',
      'psm1': 'bash',
      'bat': 'bash',
      'cmd': 'bash',
      
      // Data & Config
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'yaml',
      'ini': 'yaml',
      'conf': 'yaml',
      'cfg': 'yaml',
      
      // Database
      'sql': 'sql',
      'sqlite': 'sql',
      'mysql': 'sql',
      'pgsql': 'sql',
      
      // Others - use basic highlighting
      'go': 'javascript', // Use javascript as fallback
      'rs': 'javascript',
      'php': 'javascript',
      'rb': 'javascript',
      'swift': 'javascript',
      'md': 'text',
      'markdown': 'text',
      'rst': 'text',
      'txt': 'text',
      'dockerfile': 'bash',
      'docker': 'bash',
      'makefile': 'bash',
      'make': 'bash',
      'log': 'text',
      'diff': 'text',
      'patch': 'text'
    };
    return languageMap[ext] || 'text';
  };

  // Prism.js highlighting with line numbers
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current && fileContent) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        try {
          const codeElement = codeRef.current.querySelector('code');
          const preElement = codeRef.current;
          
          if (codeElement && preElement) {
            // Clear any existing highlighting classes
            codeElement.className = codeElement.className.replace(/language-\w+/g, '');
            const language = getLanguage(selectedFile);
            codeElement.classList.add(`language-${language}`);
            
            // Set the content first
            codeElement.textContent = fileContent;
            
            // Check if the language is supported by Prism
            if (Prism.languages[language]) {
              Prism.highlightElement(codeElement);
            } else {
              console.warn(`Language '${language}' not supported by Prism, falling back to text`);
              codeElement.className = codeElement.className.replace(/language-\w+/g, '');
              codeElement.classList.add('language-text');
            }
          }
        } catch (error) {
          console.warn('Prism highlighting error:', error);
          // Ensure the code is still readable even if highlighting fails
          const codeElement = codeRef.current?.querySelector('code');
          if (codeElement) {
            codeElement.className = 'language-text text-sm leading-6';
            codeElement.textContent = fileContent;
          }
        }
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }
  }, [fileContent, selectedFile]);

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
              projectIndex={projectIndex}
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
          <span className={`text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded language-badge file-icon-${getLanguage(selectedFile)}`}>
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
          <pre className="line-numbers" ref={codeRef}>
            <code className={`language-${getLanguage(selectedFile)} text-sm leading-6`}>
              {/* Content will be set programmatically in useEffect */}
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
            projectIndex={projectIndex}
          />
        )}
      </div>
    </div>
  );
};

export default CodeViewer;