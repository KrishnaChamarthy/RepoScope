import React from 'react';
import { Search } from 'lucide-react';
import FileTreeItem from './FileTreeItem';

const FileTree = ({ 
  files, 
  searchQuery, 
  onSearchChange, 
  expandedFolders, 
  selectedFile,
  onToggleFolder, 
  onSelectFile,
  loading 
}) => {
  const filteredFiles = files.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 border-r border-white/10 bg-slate-900/50 backdrop-blur-sm flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="text-slate-400 text-sm">Loading files...</div>
        ) : filteredFiles.length > 0 ? (
          filteredFiles.map((item, index) => (
            <FileTreeItem
              key={`${item.name}-${index}-${item.type}`} // Updated to ensure unique keys
              item={item}
              expandedFolders={expandedFolders}
              selectedFile={selectedFile}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              searchQuery={searchQuery}
            />
          ))
        ) : (
          <div className="text-slate-400 text-sm">No files found</div>
        )}
      </div>
    </div>
  );
};

export default FileTree;