import React from 'react'
import CodeStructureStats from '../components/CodeStructureStats';
import AIInsights from '../components/AIInsights';
import RepositoryStats from '../components/RepositoryStats';
import LanguageDistribution from '../components/LanguageDistribution';
import { Brain } from 'lucide-react';

const AnalyzePage = ({ selectedRepo, onGenerateReport }) => {
  if (!selectedRepo) {
    return (
      <div className="p-6 text-center text-slate-400">
        <h2 className="text-2xl font-bold text-white mb-2">Repository Analysis</h2>
        <p>Please select a repository to view its insights.</p>
      </div>
    );
  }

  const repoStats = {
    stars: selectedRepo.stargazers_count ?? 0,
    forks: selectedRepo.forks_count ?? 0,
    issues: selectedRepo.open_issues_count ?? 0,
    lastUpdated: selectedRepo.updated_at
      ? new Date(selectedRepo.updated_at).toLocaleString()
      : 'N/A',
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Repository Analysis</h2>
          <p className="text-slate-400">{selectedRepo.name}</p>
        </div>
        <button 
          onClick={onGenerateReport}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
        >
          <Brain className="w-5 h-5 inline mr-2" />
          Generate AI Report
        </button>
      </div>

      {/* Analysis Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CodeStructureStats />
          <AIInsights repo={selectedRepo} />
        </div>

        <div className="space-y-6">
          <RepositoryStats repo={repoStats} />
          <LanguageDistribution />
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;
