// Avatar asset management utilities

export type FitnessLevel = 'beginner' | 'developing' | 'athletic' | 'elite' | 'legendary';
export type ClassType = 'warrior' | 'scout' | 'endurance' | 'monk' | 'hybrid' | 'survivor';
export type SkinTone = 'verylight' | 'light' | 'medium' | 'tan' | 'dark' | 'verydark';
export type Gender = 'male' | 'female' | 'neutral';

/**
 * Map character level to fitness level tier
 */
export const getFitnessLevel = (level: number): FitnessLevel => {
  if (level <= 20) return 'beginner';
  if (level <= 40) return 'developing';
  if (level <= 60) return 'athletic';
  if (level <= 80) return 'elite';
  return 'legendary';
};

/**
 * Map class type to simplified class name for file paths
 */
export const getClassPath = (classType: string): ClassType => {
  const classMap: Record<string, ClassType> = {
    warrior: 'warrior',
    scout: 'scout',
    endurance_athlete: 'endurance',
    monk: 'monk',
    hybrid: 'hybrid',
    survivor: 'survivor'
  };
  return classMap[classType] || 'warrior';
};

/**
 * Get the path to an avatar asset
 * Format: /avatars/bodies/{gender}/{class}/{class}_{gender}_{fitnessLevel}_{skinTone}.png
 */
export const getAvatarPath = (
  classType: ClassType,
  gender: Gender,
  fitnessLevel: FitnessLevel,
  skinTone: SkinTone
): string => {
  return `/avatars/bodies/${gender}/${classType}/${classType}_${gender}_${fitnessLevel}_${skinTone}.png`;
};

/**
 * Get avatar asset with fallback
 */
export const getAvatarAsset = (
  level: number,
  classType: string,
  skinTone: SkinTone = 'medium',
  gender: Gender = 'male'
): string => {
  const fitnessLevel = getFitnessLevel(level);
  const classPath = getClassPath(classType);
  
  return getAvatarPath(classPath, gender, fitnessLevel, skinTone);
};

/**
 * Get fitness level display name
 */
export const getFitnessLevelName = (level: number): string => {
  const fitnessLevel = getFitnessLevel(level);
  const names: Record<FitnessLevel, string> = {
    beginner: 'Beginner',
    developing: 'Developing',
    athletic: 'Athletic',
    elite: 'Elite',
    legendary: 'Legendary'
  };
  return names[fitnessLevel];
};

/**
 * Get class display name
 */
export const getClassDisplayName = (classType: string): string => {
  const names: Record<string, string> = {
    warrior: 'Warrior',
    scout: 'Scout',
    endurance_athlete: 'Endurance Athlete',
    monk: 'Monk',
    hybrid: 'Hybrid Fighter',
    survivor: 'Survivor'
  };
  return names[classType] || 'Warrior';
};

/**
 * Get class color for UI
 */
export const getClassColor = (classType: string): string => {
  const colors: Record<string, string> = {
    warrior: 'warrior-red',
    scout: 'scout-blue',
    endurance_athlete: 'endurance-teal',
    monk: 'elite-purple',
    hybrid: 'apex-orange',
    survivor: 'survivor-green'
  };
  return colors[classType] || 'warrior-red';
};

/**
 * Check if avatar asset exists (client-side check)
 * Returns a promise that resolves to true if the image loads successfully
 */
export const checkAvatarExists = (path: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = path;
  });
};

