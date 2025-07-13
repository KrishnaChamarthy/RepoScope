import React, { useEffect, useState } from 'react'
import SearchBar from '../components/SearchBar';
import { ChevronRight } from 'lucide-react';
import RepositoryCard from '../components/RepositoryCard';
import SearchResult from '../components/SearchResult';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ExplorePage = ({ 
  searchQuery, 
  onSearchChange, 
  onSearch, 
  isSearching, 
  showFilters, 
  onToggleFilters, 
  repos, 
  userRepositories,
  onRepoSelect, 
  searchResults 
}) => {
  const navigate = useNavigate();
  const { user, repos: userGitHubRepos, fetchGitHubRepos, loading } = useUser();
  const [featuredRepos, setFeaturedRepos] = useState([]);

  const handleRepoSelect = (repo) => {
    onRepoSelect(repo); 
    navigate('/analyze');
  };

  // Fetch featured repos on mount
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/github/featured`);
        const data = await res.json();
        setFeaturedRepos(data.repos || []);
      } catch (err) {
        setFeaturedRepos([]);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch user's GitHub repos when user is connected
  useEffect(() => {
    if (user && userGitHubRepos.length === 0) {
      fetchGitHubRepos().catch(err => {
        console.error('Failed to fetch user repos:', err);
      });
    }
  }, [user, userGitHubRepos.length, fetchGitHubRepos]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-5xl font-bold text-white">
            Explore Code with
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> AI Intelligence</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Scan repositories, understand complex codebases, and get AI-powered explanations of functions and logic.
          </p>
        </div>

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSearch={onSearch}
          isSearching={isSearching}
          showFilters={showFilters}
          onToggleFilters={onToggleFilters}
        />
      </div>

      {userRepositories && userRepositories.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">My Repositories</h3>
            <span className="text-purple-400 text-sm">{userRepositories.length} repositories</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {userRepositories.map((repo) => (
              <RepositoryCard key={repo.id} repo={repo} onSelect={handleRepoSelect} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Featured Repositories</h3>
          <button className="text-purple-400 hover:text-purple-300 transition-colors">
            View All <ChevronRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {featuredRepos.map((repo) => (
            <RepositoryCard key={repo.id} repo={{
              id: repo.id,
              name: repo.full_name,
              description: repo.description,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              issues: repo.open_issues_count,
              language: repo.language,
              lastUpdated: new Date(repo.updated_at).toLocaleString(),
              complexity: 'Unknown',
              aiInsights: ''
            }} onSelect={handleRepoSelect} />
          ))}
        </div>
      </div>

      {/* User's GitHub Repositories */}
      {user && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">My GitHub Repositories</h3>
            {loading ? (
              <span className="text-purple-400 text-sm">Loading...</span>
            ) : (
              <span className="text-purple-400 text-sm">{userGitHubRepos.length} repositories</span>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          ) : userGitHubRepos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {userGitHubRepos.map((repo) => (
                <RepositoryCard key={repo.id} repo={{
                  id: repo.id,
                  name: repo.full_name,
                  description: repo.description,
                  stars: repo.stargazers_count,
                  forks: repo.forks_count,
                  issues: repo.open_issues_count,
                  language: repo.language,
                  lastUpdated: new Date(repo.updated_at).toLocaleString(),
                  complexity: 'Unknown',
                  aiInsights: ''
                }} onSelect={handleRepoSelect} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No repositories found</p>
            </div>
          )}
        </div>
      )}

      {searchQuery && searchResults.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Search Results</h3>
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <SearchResult key={index} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage