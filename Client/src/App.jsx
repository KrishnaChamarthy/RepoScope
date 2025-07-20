import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import ExplorePage from './pages/ExplorePage';
import AnalyzePage from './pages/AnalyzePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import RepositoryFilesPage from './pages/RepositoryFilesPage';
import { isGitHubUrl, formatRepositoryData } from './utils/githubUtils';

const Background = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-purple-500/20 via-purple-600/15 to-transparent animate-flow animate-morphing mix-blend-multiply filter blur-3xl"></div>
    <div className="absolute -bottom-1/2 -left-1/2 w-[1200px] h-[1200px] bg-gradient-to-tr from-blue-500/20 via-blue-600/15 to-transparent animate-drift mix-blend-multiply filter blur-3xl"></div>
    
    <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-purple-400/15 to-pink-400/15 animate-float mix-blend-multiply filter blur-2xl"></div>
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-blue-400/15 to-cyan-400/15 animate-drift mix-blend-multiply filter blur-2xl" style={{ animationDelay: '5s' }}></div>
    
    <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-purple-300/10 animate-float mix-blend-multiply filter blur-xl" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
    <div className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-blue-300/10 animate-drift mix-blend-multiply filter blur-xl" style={{ animationDelay: '7s', animationDuration: '12s' }}></div>
    <div className="absolute top-2/3 left-1/2 w-28 h-28 bg-indigo-300/8 animate-flow mix-blend-multiply filter blur-xl" style={{ animationDelay: '3s' }}></div>
    
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/30"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10"></div>
  </div>
);

const mockRepos = [
  {
    id: 1,
    name: 'tensorflow/tensorflow',
    description: 'An Open Source Machine Learning Framework for Everyone',
    stars: 185000,
    language: 'Python',
    lastUpdated: '2 hours ago',
    complexity: 'High',
    aiInsights: 'Complex ML framework with extensive neural network implementations'
  },
  {
    id: 2,
    name: 'facebook/react',
    description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    stars: 227000,
    language: 'JavaScript',
    lastUpdated: '5 hours ago',
    complexity: 'Medium',
    aiInsights: 'Well-structured component library with hooks and modern patterns'
  },
  {
    id: 3,
    name: 'microsoft/vscode',
    description: 'Visual Studio Code',
    stars: 163000,
    language: 'TypeScript',
    lastUpdated: '1 day ago',
    complexity: 'High',
    aiInsights: 'Sophisticated editor with extensive plugin architecture'
  }
];
const mockSearchResults = [
  {
    type: 'function',
    name: 'calculateGradient',
    file: 'src/neural/optimizer.py',
    line: 45,
    description: 'Computes gradients for backpropagation in neural networks',
    complexity: 'Medium',
    aiExplanation: 'This function implements gradient descent optimization...'
  },
  {
    type: 'class',
    name: 'TensorflowModel',
    file: 'src/models/base.py',
    line: 12,
    description: 'Base class for all TensorFlow model implementations',
    complexity: 'High',
    aiExplanation: 'Core abstraction that provides common functionality...'
  },
  {
    type: 'variable',
    name: 'LEARNING_RATE',
    file: 'config/settings.py',
    line: 8,
    description: 'Global learning rate configuration',
    complexity: 'Low',
    aiExplanation: 'Critical hyperparameter that controls training speed...'
  }
];

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userRepositories, setUserRepositories] = useState([]);

  const handleConnectGitHub = () => {
    console.log('Connecting to GitHub...');
  };

  const handleSearch = async () => {
    setIsSearching(true);
    
    try {
      if (isGitHubUrl(searchQuery)) {
        const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/github/clone`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ repoUrl: searchQuery }),
        });
        
        if (response.ok) {
          const data = await response.json();
          const formattedRepo = formatRepositoryData(data.repo);
          
          setUserRepositories(prev => {
            const exists = prev.some(repo => repo.id === formattedRepo.id);
            if (exists) {
              return prev.map(repo => repo.id === formattedRepo.id ? formattedRepo : repo);
            }
            return [...prev, formattedRepo];
          });
          setSearchQuery(''); 
        } else {
          const errorData = await response.json();
          console.error('Failed to clone repository:', errorData.error);
          alert(`Failed to clone repository: ${errorData.error}`);
        }
      } else {
        setTimeout(() => setIsSearching(false), 1500);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('An error occurred while processing your request');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
  };

  const handleGenerateReport = () => {
    console.log('Generating AI report...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <Background />
      <div className="relative z-10 min-h-screen">
        <Header onConnectGitHub={handleConnectGitHub} />
        <NavigationBar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <ExplorePage
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSearch={handleSearch}
                  isSearching={isSearching}
                  showFilters={showFilters}
                  onToggleFilters={() => setShowFilters(!showFilters)}
                  repos={mockRepos}
                  userRepositories={userRepositories}
                  onRepoSelect={handleRepoSelect}
                  searchResults={mockSearchResults}
                />
              }
            />
            <Route
              path="/analyze"
              element={
                <AnalyzePage
                  selectedRepo={selectedRepo}
                  onGenerateReport={handleGenerateReport}
                />
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/repo/:owner/:repo/files" element={<RepositoryFilesPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;