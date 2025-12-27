import React from 'react';
import { RotateCcw, Database, RefreshCw } from 'lucide-react';
import { initializeDemoData } from '../utils/demoData';

const DemoControls = ({ onDataReset }) => {
  const handleResetDemo = () => {
    if (window.confirm('This will reset all data to demo state with 18 equipment pieces and 18 technicians. Are you sure?')) {
      localStorage.removeItem('gearguard-data');
      initializeDemoData();
      window.location.reload();
    }
  };

  const handleForceReset = () => {
    // Force clear everything and reload
    localStorage.clear();
    window.location.reload();
  };

  const handleClearData = () => {
    if (window.confirm('This will clear all data. Are you sure?')) {
      localStorage.removeItem('gearguard-data');
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      <button
        onClick={handleResetDemo}
        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm shadow-lg font-medium"
        title="Reset to full demo data (18 equipment + 18 technicians)"
      >
        <RotateCcw className="h-4 w-4" />
        Reset Full Demo
      </button>
      <button
        onClick={handleForceReset}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm shadow-lg"
        title="Force complete reset"
      >
        <RefreshCw className="h-4 w-4" />
        Force Reset
      </button>
      <button
        onClick={handleClearData}
        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm shadow-lg"
        title="Clear all data"
      >
        <Database className="h-4 w-4" />
        Clear Data
      </button>
    </div>
  );
};

export default DemoControls;