import React from 'react'

const CodeStructureStats = ({ stats }) => (
  <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
    <h3 className="text-xl font-bold text-white mb-4">Code Structure</h3>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-300">Functions</span>
        <span className="text-purple-400 font-medium">1,247</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-300">Classes</span>
        <span className="text-blue-400 font-medium">342</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-300">Files</span>
        <span className="text-green-400 font-medium">856</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-300">Lines of Code</span>
        <span className="text-yellow-400 font-medium">45,678</span>
      </div>
    </div>
  </div>
);

export default CodeStructureStats