import React from 'react'

const CodeStructureStats = ({ stats }) => {
  // Use provided stats or fallback to placeholder data
  const data = stats ? {
    functions: stats.estimatedFunctions || 0,
    classes: stats.estimatedClasses || 0,
    files: stats.totalFiles || 0,
    lines: stats.estimatedLines || 0,
    testFiles: stats.testFiles || 0,
    configFiles: stats.configFiles || 0
  } : {
    functions: 0,
    classes: 0,
    files: 0,
    lines: 0,
    testFiles: 0,
    configFiles: 0
  };

  return (
    <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-4">Code Structure</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Functions</span>
          <span className="text-purple-400 font-medium">{data.functions.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Classes</span>
          <span className="text-blue-400 font-medium">{data.classes.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Total Files</span>
          <span className="text-green-400 font-medium">{data.files.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Lines of Code</span>
          <span className="text-yellow-400 font-medium">{data.lines.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Test Files</span>
          <span className="text-cyan-400 font-medium">{data.testFiles.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Config Files</span>
          <span className="text-orange-400 font-medium">{data.configFiles.toLocaleString()}</span>
        </div>
      </div>
      
      {!stats && (
        <div className="mt-3 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
          <p className="text-yellow-400 text-xs">⚠️ Loading repository analysis...</p>
        </div>
      )}
    </div>
  );
};

export default CodeStructureStats