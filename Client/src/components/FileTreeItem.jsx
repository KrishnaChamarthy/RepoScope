import React from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

const FileTreeItem = ({ 
  item, 
  currentPath = '', 
  expandedFolders, 
  selectedFile,
  onToggleFolder, 
  onSelectFile,
  searchQuery 
}) => {
  const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
  const isExpanded = expandedFolders.has(fullPath);

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4";
    
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <File className={`${iconClass} text-yellow-400`} />;
      case 'py':
        return <File className={`${iconClass} text-blue-400`} />;
      case 'java':
        return <File className={`${iconClass} text-red-400`} />;
      case 'css':
      case 'scss':
        return <File className={`${iconClass} text-purple-400`} />;
      case 'html':
        return <File className={`${iconClass} text-orange-400`} />;
      case 'md':
        return <File className={`${iconClass} text-green-400`} />;
      case 'json':
        return <File className={`${iconClass} text-gray-400`} />;
      default:
        return <File className={`${iconClass} text-slate-400`} />;
    }
  };

  const renderChildren = () => {
    if (!item.children) return null;
    
    const filteredChildren = item.children.filter(child => 
      child.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredChildren.map((child, index) => (
      <FileTreeItem
        key={`${fullPath}/${child.name}-${index}-${child.type}`} // More unique key
        item={child}
        currentPath={fullPath}
        expandedFolders={expandedFolders}
        selectedFile={selectedFile}
        onToggleFolder={onToggleFolder}
        onSelectFile={onSelectFile}
        searchQuery={searchQuery}
      />
    ));
  };

  if (item.type === 'dir') {
    return (
      <div key={`dir-${fullPath}`} className="select-none">
        <div
          onClick={() => onToggleFolder(fullPath)}
          className="flex items-center space-x-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer group"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
          <Folder className="w-4 h-4 text-blue-400" />
          <span className="text-white text-sm group-hover:text-purple-300">
            {item.name}
          </span>
        </div>
        {isExpanded && (
          <div className="ml-6 border-l border-white/10">
            {renderChildren()}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div
        key={`file-${fullPath}`}
        onClick={() => onSelectFile(fullPath)}
        className={`flex items-center space-x-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer group ${
          selectedFile === fullPath ? 'bg-purple-500/20' : ''
        }`}
      >
        {getFileIcon(item.name)}
        <span className="text-slate-300 text-sm group-hover:text-white">
          {item.name}
        </span>
      </div>
    );
  }
};

export default FileTreeItem;