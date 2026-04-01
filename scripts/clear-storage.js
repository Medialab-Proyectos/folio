// Clear all GarageFolio storage keys from localStorage
// Run this in the browser console if you encounter storage issues

if (typeof window !== 'undefined') {
  const keys = Object.keys(localStorage);
  const gfKeys = keys.filter(key => key.startsWith('GF_'));
  
  console.log('[v0] Found GarageFolio keys:', gfKeys);
  
  gfKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log('[v0] Removed:', key);
  });
  
  console.log('[v0] Storage cleared. Please refresh the page.');
  
  // Force reload
  window.location.reload();
}
