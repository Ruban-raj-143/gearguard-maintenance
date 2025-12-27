import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Requests from './pages/Requests';
import Calendar from './pages/Calendar';
import Teams from './pages/Teams';

// Import test functions for development
if (process.env.NODE_ENV === 'development') {
  import('./utils/testFunctions');
}

function App() {
  // Test click handler
  const handleAppClick = () => {
    console.log('🎯 App click handler working!');
  };

  return (
    <div onClick={handleAppClick}>
      <DataProvider>
        <DndProvider backend={HTML5Backend}>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/equipment" element={<Equipment />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/teams" element={<Teams />} />
              </Routes>
            </Layout>
          </Router>
        </DndProvider>
      </DataProvider>
    </div>
  );
}

export default App;