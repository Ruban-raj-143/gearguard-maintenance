// Force reset demo data - run this in browser console
export const forceResetDemoData = () => {
  // Clear existing data
  localStorage.removeItem('gearguard-data');
  
  // Force reload the page to reinitialize with fresh data
  window.location.reload();
};

// Auto-run this function when imported
if (typeof window !== 'undefined') {
  console.log('🔄 Forcing demo data reset...');
  forceResetDemoData();
}