import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { getAvatarAsset, type SkinTone, type Gender } from '@/utils/avatarAssets';

const CLASS_COLORS = {
  warrior: ['b91c1c', 'dc2626'],
  scout: ['059669', '10b981'],
  endurance_athlete: ['2563eb', '3b82f6'],
  monk: ['7c3aed', '8b5cf6'],
  hybrid: ['d97706', 'f59e0b'],
  survivor: ['64748b', '94a3b8']
};

export const useAvatar = (
  userId: string,
  classType: string = 'warrior',
  equipment: any[] = [],
  level: number = 1,
  skinTone: SkinTone = 'medium',
  gender: Gender = 'male',
  useRealAssets: boolean = true
) => {
  return useMemo(() => {
    // Use real avatar assets if available
    if (useRealAssets) {
      return getAvatarAsset(level, classType, skinTone, gender);
    }
    
    // Fallback to DiceBear generated avatars
    const colors = CLASS_COLORS[classType as keyof typeof CLASS_COLORS] || CLASS_COLORS.warrior;
    
    return createAvatar(adventurer, {
      seed: userId,
      backgroundColor: [colors[0]],
    }).toDataUri();
  }, [userId, classType, equipment, level, skinTone, gender, useRealAssets]);
};

