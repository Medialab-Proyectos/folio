import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.garage.app',
  appName: 'GarageApp',
  webDir: 'public',
  server: {
    url: 'https://folio-sigma-sepia.vercel.app/',
    cleartext: true
  }
};

export default config;
