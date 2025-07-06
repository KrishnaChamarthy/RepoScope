import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import InsightsPage from './pages/InsightsPage';
import ExplorePage from './pages/ExplorePage';
import AnalyzePage from './pages/AnalyzePage';
import ProfilePage from './pages/ProfilePage';

const Background = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
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

  const handleConnectGitHub = () => {
    console.log('Connecting to GitHub...');
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1500);
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
  };

  const handleGenerateReport = () => {
    console.log('Generating AI report...');
  };

  const handleAnalyzeComplexity = () => {
    console.log('Analyzing complexity...');
  };

  const handleGetRecommendations = () => {
    console.log('Getting recommendations...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Background />
      <div className="relative z-10">
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
                  onRepoSelect={handleRepoSelect}
                  searchResults={mockSearchResults}
                />
              }
            />
            <Route
              path="/analyze"
              element={
                selectedRepo ? (
                  <AnalyzePage
                    selectedRepo={selectedRepo}
                    onGenerateReport={handleGenerateReport}
                  />
                ) : (
                  <div>Please select a repository to analyze.</div>
                )
              }
            />
            <Route
              path="/insights"
              element={
                <InsightsPage
                  onAnalyzeComplexity={handleAnalyzeComplexity}
                  onGetRecommendations={handleGetRecommendations}
                />
              }
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;