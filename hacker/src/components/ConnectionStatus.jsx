import { useState } from 'react';
import { useData } from '../contexts/DataContext';

const ConnectionStatus = () => {
  const { connectionStatus, reconnect, switchToFallback, switchToApi } = useData();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    await reconnect();
    setIsReconnecting(false);
  };

  if (connectionStatus.isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      
      <div className="text-sm">
        {connectionStatus.isOnline ? (
          <div className="flex items-center space-x-2">
            <span className="text-green-700 font-medium">API Connected</span>
            {connectionStatus.lastSync && (
              <span className="text-gray-500 text-xs">
                Last sync: {new Date(connectionStatus.lastSync).toLocaleTimeString()}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-red-700 font-medium">Offline Mode</span>
            <button
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded disabled:opacity-50"
            >
              {isReconnecting ? 'Connecting...' : 'Reconnect'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;