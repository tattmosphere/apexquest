import { Capacitor } from '@capacitor/core';

export const isNativeiOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

export const isNativeAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

export const isNative = (): boolean => {
  return isNativeiOS() || isNativeAndroid();
};

export const supportsHealthSync = (): boolean => {
  // Health sync is only available on native iOS and Android
  return isNative();
};

export const getPlatformName = (): string => {
  if (isNativeiOS()) return 'Apple Health';
  if (isNativeAndroid()) return 'Health Connect';
  return 'Web';
};
