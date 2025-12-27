import { useState, useEffect } from 'react';
import { 
  Settings, 
  ClipboardList, 
  Users, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { getHealthScoreColor } from '../utils/helpers';
import FeatureShowcase from '../components/FeatureShowcase';

const Dashboard = () => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [data, setData] = useState({
    equipment: [],
    requests: [],
    technicians: [],
    warnings: []
  });
  const [loading, setLoading] = useState(true);
  
  const { getEquipment, getRequests, getTechnicians, getEquipmentBreakdownWarnings } = useData();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [equipment, requests, technicians, warnings] = await Promise.all([
          getEquipment(),
          getRequests(),
          getTechnicians(),
          getEquipmentBreakdownWarnings()
        ]);
        
        setData({
          equipment: equipment || [],
          requests: requests || [],
          technicians: technicians || [],
          warnings: warnings || []
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getEquipment, getRequests, getTechnicians, getEquipmentBreakdownWarnings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  const { equipment, requests, technicians, warnings } = data;

  const stats = {
    totalEquipment: equipment.length,
    usableEquipment: equipment.filter(eq => eq.is_usable !== 0 && eq.isUsable !== false).length,
    activeRequests: requests.filter(r => r.status === 'New' || r.status === 'In Progress').length,
    totalTechnicians: technicians.length,
    avgHealthScore: equipment.length > 0 
      ? Math.round(equipment.reduce((sum, eq) => sum + (eq.health_score || eq.healthScore || 0), 0) / equipment.length)
      : 0
  };

  const recentRequests = requests
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const criticalEquipment = equipment
    .filter(eq => (eq.health_score || eq.healthScore || 0) < 40 && (eq.is_usable !== 0 && eq.isUsable !== false))
    .sort((a, b) => (a.health_score || a.healthScore || 0) - (b.health_score || b.healthScore || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your maintenance operations</p>
        </div>
        <button
          onClick={() => setShowFeatures(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="h-5 w-5" />
          View Unique Features
        </button>
      </div>

      {/* Equipment Count Check */}
      {equipment.length < 18 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="font-semibold text-yellow-800">Demo Data Issue</h3>
                <p className="text-sm text-yellow-700">
                  Only {equipment.length} equipment showing instead of 18. Click "Reset Full Demo" button (bottom right) to load all equipment and technicians.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('gearguard-data');
                window.location.reload();
              }}
              className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 text-sm"
            >
              Reset Now
            </button>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-800">Equipment Warnings</h3>
          </div>
          <div className="space-y-1">
            {warnings.map((warning, index) => (
              <p key={index} className="text-sm text-red-700">
                {warning.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Equipment</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEquipment}</p>
              <p className="text-xs text-green-600">{stats.usableEquipment} usable</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClipboardList className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeRequests}</p>
              <p className="text-xs text-gray-500">In progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Technicians</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTechnicians}</p>
              <p className="text-xs text-gray-500">Available</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Health Score</p>
              <p className={`text-2xl font-semibold ${getHealthScoreColor(stats.avgHealthScore)}`}>
                {stats.avgHealthScore}%
              </p>
              <p className="text-xs text-gray-500">Overall condition</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
          </div>
          <div className="p-6">
            {recentRequests.length > 0 ? (
              <div className="space-y-4">
                {recentRequests.map(request => {
                  const eq = equipment.find(e => e.id === request.equipmentId);
                  return (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{request.subject}</p>
                        <p className="text-sm text-gray-600">{eq?.name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'New' ? 'bg-blue-100 text-blue-700' :
                          request.status === 'In Progress' ? 'bg-orange-100 text-orange-700' :
                          request.status === 'Repaired' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent requests</p>
            )}
          </div>
        </div>

        {/* Critical Equipment */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Critical Equipment</h3>
            <p className="text-sm text-gray-600">Equipment with health score below 40%</p>
          </div>
          <div className="p-6">
            {criticalEquipment.length > 0 ? (
              <div className="space-y-4">
                {criticalEquipment.map(eq => (
                  <div key={eq.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{eq.name}</p>
                      <p className="text-sm text-gray-600">{eq.location}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${getHealthScoreColor(eq.health_score || eq.healthScore || 0)}`}>
                        {eq.health_score || eq.healthScore || 0}%
                      </p>
                      <p className="text-xs text-gray-500">Health Score</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">All equipment in good condition!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Showcase Modal */}
      {showFeatures && (
        <FeatureShowcase onClose={() => setShowFeatures(false)} />
      )}
    </div>
  );
};

export default Dashboard;