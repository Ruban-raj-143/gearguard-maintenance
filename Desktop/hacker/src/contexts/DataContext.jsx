import { createContext, useContext, useState, useEffect } from 'react';
import { apiDataStore } from '../utils/apiDataStore.js';
import { dataStore as fallbackStore } from '../utils/dataStore.js';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState({
    isOnline: false,
    isLoading: true,
    lastSync: null
  });

  const [dataStore, setDataStore] = useState(apiDataStore);

  useEffect(() => {
    // Initialize connection and check status
    const initializeConnection = async () => {
      try {
        await apiDataStore.checkConnectivity();
        const status = apiDataStore.getConnectionStatus();
        setConnectionStatus({
          isOnline: status.isOnline,
          isLoading: false,
          lastSync: status.lastSync
        });

        if (status.isOnline) {
          // Preload data for better performance
          await Promise.all([
            apiDataStore.getEquipment(),
            apiDataStore.getTeams(),
            apiDataStore.getTechnicians(),
            apiDataStore.getRequests()
          ]);
        }
      } catch (error) {
        console.error('Failed to initialize data connection:', error);
        setConnectionStatus({
          isOnline: false,
          isLoading: false,
          lastSync: null
        });
      }
    };

    initializeConnection();
  }, []);

  const reconnect = async () => {
    setConnectionStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const isOnline = await apiDataStore.reconnect();
      const status = apiDataStore.getConnectionStatus();
      
      setConnectionStatus({
        isOnline,
        isLoading: false,
        lastSync: status.lastSync
      });

      return isOnline;
    } catch (error) {
      console.error('Reconnection failed:', error);
      setConnectionStatus({
        isOnline: false,
        isLoading: false,
        lastSync: null
      });
      return false;
    }
  };

  const switchToFallback = () => {
    setDataStore(fallbackStore);
    setConnectionStatus({
      isOnline: false,
      isLoading: false,
      lastSync: null
    });
  };

  const switchToApi = () => {
    setDataStore(apiDataStore);
    reconnect();
  };

  const value = {
    dataStore,
    connectionStatus,
    reconnect,
    switchToFallback,
    switchToApi,
    
    // Convenience methods that delegate to the current data store
    getEquipment: () => dataStore.getEquipment(),
    addEquipment: (equipment) => dataStore.addEquipment(equipment),
    updateEquipment: (id, updates) => dataStore.updateEquipment(id, updates),
    
    getTeams: () => dataStore.getTeams(),
    
    getTechnicians: () => dataStore.getTechnicians(),
    getTechniciansByTeam: (teamId) => dataStore.getTechniciansByTeam(teamId),
    
    getRequests: () => dataStore.getRequests(),
    addRequest: (request) => dataStore.addRequest(request),
    updateRequest: (id, updates) => dataStore.updateRequest(id, updates),
    
    // Smart automation methods
    getMaintenanceTeamForEquipment: (equipmentId) => dataStore.getMaintenanceTeamForEquipment(equipmentId),
    suggestTechnician: (teamId) => dataStore.suggestTechnician(teamId),
    calculatePriority: (equipmentId, requestType) => dataStore.calculatePriority(equipmentId, requestType),
    getEquipmentBreakdownWarnings: () => dataStore.getEquipmentBreakdownWarnings(),
    
    // Analytics (API only)
    getDashboardAnalytics: () => dataStore.getDashboardAnalytics ? dataStore.getDashboardAnalytics() : null
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};