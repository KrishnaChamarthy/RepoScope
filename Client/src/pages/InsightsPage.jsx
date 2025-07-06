import { Brain, Lightbulb } from 'lucide-react';
import React from 'react'

const InsightsPage = ({ onAnalyzeComplexity, onGetRecommendations }) => (
  <div className="space-y-8">
    <div className="text-center space-y-4">
      <h2 className="text-3xl font-bold text-white">AI-Powered Insights</h2>
      <p className="text-slate-400 max-w-2xl mx-auto">
        Discover patterns, understand complex logic, and get intelligent explanations of your codebase.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Code Complexity Analysis</h3>
        </div>
        <p className="text-slate-300 mb-4">
          AI-powered analysis of your codebase complexity, identifying areas that might need refactoring or optimization.
        </p>
        <button 
          onClick={onAnalyzeComplexity}
          className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
        >
          Analyze Complexity
        </button>
      </div>

      <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Lightbulb className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Smart Recommendations</h3>
        </div>
        <p className="text-slate-300 mb-4">
          Get intelligent suggestions for code improvements, performance optimizations, and best practices.
        </p>
        <button 
          onClick={onGetRecommendations}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
        >
          Get Recommendations
        </button>
      </div>
    </div>
  </div>
);

export default InsightsPage