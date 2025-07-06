import React, { useEffect } from 'react';
import { useUser } from '../context/UserContext';

const ProfilePage = () => {
  const { user, fetchGitHubRepos, repos, loading } = useUser();

  useEffect(() => {
    if (user) fetchGitHubRepos();
  }, [user]);

  if (!user) {
    return <div className="text-center text-slate-300 mt-10">Please log in with GitHub to view your profile.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white/10 rounded-xl p-8 shadow-lg">
      <div className="flex items-center space-x-6 mb-6">
        <img
          src={user.photos?.[0]?.value || `https://github.com/${user.username}.png`}
          alt="Profile"
          className="w-20 h-20 rounded-full border-4 border-purple-400"
        />
        <div>
          <h2 className="text-2xl font-bold text-white">{user.displayName || user.username}</h2>
          <p className="text-slate-400">@{user.username}</p>
          <a
            href={user.profileUrl || `https://github.com/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            View on GitHub
          </a>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-4">Your Public Repositories</h3>
      {loading ? (
        <div className="text-slate-300">Loading repositories...</div>
      ) : (
        <ul className="space-y-3">
          {repos.map((repo) => (
            <li key={repo.id} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
              <div>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 font-semibold hover:underline"
                >
                  {repo.full_name}
                </a>
                <p className="text-slate-400 text-sm">{repo.description}</p>
              </div>
              <span className="text-slate-400 text-sm">★ {repo.stargazers_count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfilePage;