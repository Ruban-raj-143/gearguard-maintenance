import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Calendar, 
  Users, 
  ClipboardList,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import ConnectionStatus from './ConnectionStatus';
import DemoControls from './DemoControls';
import DebugInfo from './DebugInfo';

const Layout = ({ children }) => {
  const location = useLocation();
  const { getEquipmentBreakdownWarnings } = useData();
  
  // Get warnings (this will work with both API and fallback)
  const warnings = getEquipmentBreakdownWarnings() || [];

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Equipment', href: '/equipment', icon: Settings },
    { name: 'Requests', href: '/requests', icon: ClipboardList },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Teams', href: '/teams', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">GearGuard</h1>
              <span className="ml-2 text-sm text-gray-500">The Ultimate Maintenance Tracker</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              
              {warnings.length > 0 && (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">{warnings.length} Equipment Warning(s)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Demo Controls */}
      <DemoControls />
      
      {/* Debug Info (development only) */}
      <DebugInfo />
    </div>
  );
};

export default Layout;