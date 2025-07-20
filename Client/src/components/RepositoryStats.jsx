import { Calendar, GitBranch, Star, Users, AlertCircle, Database } from 'lucide-react';
import React from 'react';

const RepositoryStats = ({ repo }) => (
  <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
    <h3 className="text-xl font-bold text-white mb-4">Repository Stats</h3>
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Star className="w-5 h-5 text-yellow-400" />
        <div>
          <p className="text-white font-medium">{repo.stars?.toLocaleString?.() ?? 0}</p>
          <p className="text-slate-400 text-sm">Stars</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <GitBranch className="w-5 h-5 text-green-400" />
        <div>
          <p className="text-white font-medium">{repo.forks?.toLocaleString?.() ?? 0}</p>
          <p className="text-slate-400 text-sm">Forks</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-5 h-5 text-red-400" />
        <div>
          <p className="text-white font-medium">{repo.issues?.toLocaleString?.() ?? 0}</p>
          <p className="text-slate-400 text-sm">Open Issues</p>
        </div>
      </div>
      {repo.contributors && (
        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-white font-medium">{repo.contributors?.toLocaleString?.() ?? 0}</p>
            <p className="text-slate-400 text-sm">Contributors</p>
          </div>
        </div>
      )}
      {repo.size && (
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-white font-medium">{(repo.size / 1024).toFixed(1)} MB</p>
            <p className="text-slate-400 text-sm">Repository Size</p>
          </div>
        </div>
      )}
      <div className="flex items-center space-x-3">
        <Calendar className="w-5 h-5 text-purple-400" />
        <div>
          <p className="text-white font-medium">{repo.lastUpdated}</p>
          <p className="text-slate-400 text-sm">Last Update</p>
        </div>
      </div>
    </div>
  </div>
);

export default RepositoryStats;