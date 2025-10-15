import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';

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
  equipment: any[] = []
) => {
  return useMemo(() => {
    const colors = CLASS_COLORS[classType as keyof typeof CLASS_COLORS] || CLASS_COLORS.warrior;
    
    return createAvatar(adventurer, {
      seed: userId,
      backgroundColor: [colors[0]],
    }).toDataUri();
  }, [userId, classType, equipment]);
};
