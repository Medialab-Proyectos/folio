'use client';

import { useEffect } from 'react';

/**
 * Component that automatically cleans old storage versions
 * This runs once on app load to prevent circular dependency issues
 */
export function StorageMigrator() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Remove old V1 storage if it exists
      const oldKey = 'GF_ENTERPRISE_DATA_V1';
      if (localStorage.getItem(oldKey)) {
        console.log('[v0] Found old storage version, removing...');
        localStorage.removeItem(oldKey);
        console.log('[v0] Old storage removed, app will reinitialize with V2');
      }
    } catch (error) {
      console.error('[v0] Error during storage migration:', error);
    }
  }, []);

  return null; // This component doesn't render anything
}
