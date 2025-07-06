import { Brain, Lightbulb } from 'lucide-react';
import React from 'react'

const AIInsights = () => (
  <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
    <h3 className="text-xl font-bold text-white mb-4">AI Insights</h3>
    <div className="space-y-4">
      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-purple-400">Architecture Pattern</span>
        </div>
        <p className="text-slate-300">This repository follows a modular architecture with clear separation of concerns. The ML components are well-abstracted.</p>
      </div>
      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <Lightbulb className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-blue-400">Code Quality</span>
        </div>
        <p className="text-slate-300">High code quality with comprehensive documentation and consistent naming conventions throughout.</p>
      </div>
    </div>
  </div>
);

export default AIInsights