import React from 'react';
import { Brain, X } from 'lucide-react';

const ExplanationPanel = ({ explanation, onClose }) => {
  const formatText = (text) => {
    // Handle code snippets (text between backticks)
    return text.split('`').map((part, index) => {
      if (index % 2 === 1) {
        // This is code (odd indices are between backticks)
        return (
          <code key={index} className="bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded text-xs font-mono">
            {part}
          </code>
        );
      }
      
      // Handle bold text (between **)
      return part.split('**').map((subPart, subIndex) => {
        if (subIndex % 2 === 1) {
          return (
            <strong key={`${index}-${subIndex}`} className="text-white font-semibold">
              {subPart}
            </strong>
          );
        }
        return subPart;
      });
    });
  };

  return (
    <div className="w-1/2 border-l border-white/10 bg-slate-900/40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-medium">AI Explanation</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="prose prose-invert max-w-none">
          <div className="text-slate-300 leading-relaxed space-y-4">
            {explanation.split('\n\n').map((paragraph, index) => {
              // Handle headers (lines starting with **)
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                const headerText = paragraph.replace(/\*\*/g, '');
                return (
                  <h4 key={index} className="text-purple-300 font-semibold text-base mt-6 mb-3">
                    {headerText}
                  </h4>
                );
              }
              
              // Handle bullet points
              if (paragraph.includes('* ')) {
                const items = paragraph.split('* ').filter(item => item.trim());
                return (
                  <ul key={index} className="list-disc list-inside space-y-2 ml-4">
                    {items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm">
                        {formatText(item.trim())}
                      </li>
                    ))}
                  </ul>
                );
              }
              
              // Handle regular paragraphs
              return (
                <p key={index} className="text-sm leading-relaxed">
                  {formatText(paragraph)}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplanationPanel;