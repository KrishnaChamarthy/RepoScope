import React from "react";
import { Github, Code2, Settings, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, connectGitHub, fetchGitHubUser, logout } = useUser();

  React.useEffect(() => {
    // On mount, try to fetch user info (after OAuth redirect)
    fetchGitHubUser();
  }, []);

  return (
    <header className="border-b border-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                RepoScope
              </h1>
              <p className="text-slate-400 text-sm">
                Intelligent Code Exploration
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/settings"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-slate-400" />
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Profile"
                >
                  <img
                    src={user.photos?.[0]?.value || `https://github.com/${user.username}.png`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-purple-400"
                  />
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 flex items-center bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={connectGitHub}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                <Github className="w-4 h-4 inline mr-2" />
                Connect GitHub
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
