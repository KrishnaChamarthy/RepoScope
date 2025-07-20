import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import CodeStructureStats from '../components/CodeStructureStats';
import AIInsights from '../components/AIInsights';
import RepositoryStats from '../components/RepositoryStats';
import LanguageDistribution from '../components/LanguageDistribution';
import { Brain, Loader2, FileText } from 'lucide-react';

const AnalyzePage = ({ selectedRepo }) => {
  const { api } = useUser();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract owner and repo from selectedRepo
  const getOwnerAndRepo = () => {
    if (!selectedRepo?.name) return { owner: null, repo: null };
    
    // Handle different name formats
    if (selectedRepo.name.includes('/')) {
      const [owner, repo] = selectedRepo.name.split('/');
      return { owner, repo };
    }
    
    // If no slash, try to get from full_name or other fields
    if (selectedRepo.full_name) {
      const [owner, repo] = selectedRepo.full_name.split('/');
      return { owner, repo };
    }
    
    return { owner: null, repo: null };
  };

  const { owner, repo } = getOwnerAndRepo();

  // Navigate to files view
  const handleViewFiles = () => {
    if (owner && repo) {
      navigate(`/repo/${owner}/${repo}/files`);
    }
  };

  // Fetch repository analysis data when component mounts or selectedRepo changes
  useEffect(() => {
    if (selectedRepo && owner && repo) {
      fetchAnalysisData();
    }
  }, [selectedRepo, owner, repo]);

  const fetchAnalysisData = async () => {
    if (!owner || !repo) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/analysis/repo/${owner}/${repo}/analysis`);
      
      if (response.data.success) {
        setAnalysisData(response.data.analysis);
      } else {
        setError(response.data.error || 'Failed to fetch analysis');
      }
    } catch (err) {
      console.error('Failed to fetch repository analysis:', err);
      setError('Failed to load repository analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRepo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Repository Analysis</h2>
            <p className="text-slate-400 text-lg mb-6">
              Discover deep insights about your repositories with AI-powered analysis
            </p>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-4">Get Started</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">1</span>
                </div>
                <p className="text-slate-300">Go to the <span className="text-purple-400 font-medium">Explore</span> page</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">2</span>
                </div>
                <p className="text-slate-300">Select or clone a repository</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">3</span>
                </div>
                <p className="text-slate-300">Return here to view detailed insights</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-200 border border-purple-500/30"
            >
              <FileText className="w-4 h-4" />
              Explore Repositories
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Repository</h2>
          <p className="text-slate-400">Gathering insights for {selectedRepo.name}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Repository Analysis</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
        <button 
          onClick={fetchAnalysisData}
          className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const repoStats = analysisData ? {
    stars: analysisData.stats.stars,
    forks: analysisData.stats.forks,
    issues: analysisData.stats.issues,
    lastUpdated: analysisData.stats.lastUpdated,
    contributors: analysisData.stats.contributors,
    size: analysisData.stats.size
  } : {
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
          {analysisData && (
            <p className="text-slate-500 text-sm mt-1">
              {analysisData.repository.projectType} • {analysisData.repository.complexity} Complexity
            </p>
          )}
        </div>
        <div>
          <button
            onClick={handleViewFiles}
            disabled={!owner || !repo}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            View Files
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CodeStructureStats stats={analysisData?.codeStructure} />
          <AIInsights 
            repo={{
              ...selectedRepo,
              aiInsights: analysisData?.aiInsights.summary,
              projectType: analysisData?.repository.projectType,
              frameworks: analysisData?.repository.frameworks,
              isUserRepo: true // Show detailed insights
            }} 
          />
        </div>

        <div className="space-y-6">
          <RepositoryStats repo={repoStats} />
          <LanguageDistribution languages={analysisData?.languageDistribution} />
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;
