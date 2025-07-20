import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'explore', path: '/' },
  { label: 'analyze', path: '/analyze' },
];

const NavigationBar = () => {
  const location = useLocation();

  return (
    <nav className="border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.path}
              className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                location.pathname === tab.path
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;