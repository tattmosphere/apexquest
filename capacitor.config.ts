import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.d297ef1d217741ef8d87722d29ed47d8',
  appName: 'ApexQuest',
  webDir: 'dist',
  server: {
    url: 'https://d297ef1d-2177-41ef-8d87-722d29ed47d8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
    },
  },
};

export default config;
