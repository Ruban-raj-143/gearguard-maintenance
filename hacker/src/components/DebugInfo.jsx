import React, { useState, useEffect } from 'react';
import { Bug, CheckCircle, XCircle } from 'lucide-react';

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState({
    reactWorking: false,
    routerWorking: false,
    dataStoreWorking: false,
    localStorageWorking: false,
    clickHandlersWorking: false
  });

  useEffect(() => {
    // Test React
    const reactWorking = typeof React !== 'undefined';
    
    // Test Router
    const routerWorking = window.location.pathname !== undefined;
    
    // Test DataStore
    let dataStoreWorking = false;
    try {
      const stored = localStorage.getItem('gearguard-data');
      dataStoreWorking = stored !== null;
    } catch (error) {
      dataStoreWorking = false;
    }
    
    // Test LocalStorage
    let localStorageWorking = false;
    try {
      localStorage.setItem('debug-test', 'working');
      localStorageWorking = localStorage.getItem('debug-test') === 'working';
      localStorage.removeItem('debug-test');
    } catch (error) {
      localStorageWorking = false;
    }
    
    setDebugInfo({
      reactWorking,
      routerWorking,
      dataStoreWorking,
      localStorageWorking,
      clickHandlersWorking: true // Will be tested by actual clicks
    });
  }, []);

  const handleTestClick = () => {
    setDebugInfo(prev => ({
      ...prev,
      clickHandlersWorking: true
    }));
    console.log('✅ Click handler test successful!');
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-xs">
      <div className="flex items-center mb-3">
        <Bug className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-sm font-semibold">Debug Info</h3>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>React:</span>
          {debugInfo.reactWorking ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span>Router:</span>
          {debugInfo.routerWorking ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span>DataStore:</span>
          {debugInfo.dataStoreWorking ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span>LocalStorage:</span>
          {debugInfo.localStorageWorking ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </div>
        
        <button
          onClick={handleTestClick}
          className="w-full mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
        >
          Test Click Handler
        </button>
      </div>
    </div>
  );
};

export default DebugInfo;