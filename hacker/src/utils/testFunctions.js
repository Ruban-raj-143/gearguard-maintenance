// Simple test functions to verify the application is working
export const testBasicFunctionality = () => {
  console.log('🧪 Testing GearGuard functionality...');
  
  // Test 1: Check if React is working
  if (typeof React !== 'undefined') {
    console.log('✅ React is loaded');
  } else {
    console.log('❌ React not found');
  }
  
  // Test 2: Check if data store is working
  try {
    const { dataStore } = require('./dataStore');
    const equipment = dataStore.getEquipment();
    console.log(`✅ DataStore working - ${equipment.length} equipment loaded`);
  } catch (error) {
    console.log('❌ DataStore error:', error.message);
  }
  
  // Test 3: Check if localStorage is working
  try {
    localStorage.setItem('test', 'working');
    const test = localStorage.getItem('test');
    if (test === 'working') {
      console.log('✅ LocalStorage working');
      localStorage.removeItem('test');
    }
  } catch (error) {
    console.log('❌ LocalStorage error:', error.message);
  }
  
  console.log('🎯 Test complete - Check console for results');
};

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(testBasicFunctionality, 1000);
}