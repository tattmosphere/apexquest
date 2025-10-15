# Avatar System Usage Guide

## Overview

The ApexQuest avatar system now supports **two asset types** for flexible UI display:

1. **Full Body Avatars** (512×768px portrait) - For detailed character views
2. **Portrait Thumbnails** (256×256px square) - For compact UI displays

## Asset Inventory

### Current Assets
- ✅ **60 Full Body Avatars**: 30 male + 30 female warriors
- ✅ **60 Portrait Thumbnails**: 30 male + 30 female warriors
- **Total**: 120 warrior avatar assets

### Coverage
- **Classes**: Warrior (complete)
- **Genders**: Male, Female
- **Fitness Levels**: Beginner, Developing, Athletic, Elite, Legendary (5 levels)
- **Skin Tones**: Very Light, Light, Medium, Tan, Dark, Very Dark (6 tones)

## File Structure

```
/public/avatars/
├── bodies/                    # Full body avatars (512×768px)
│   ├── male/
│   │   └── warrior/
│   │       ├── warrior_male_beginner_verylight.png
│   │       ├── warrior_male_beginner_light.png
│   │       └── ... (30 total)
│   └── female/
│       └── warrior/
│           ├── warrior_female_beginner_verylight.png
│           ├── warrior_female_beginner_light.png
│           └── ... (30 total)
└── portraits/                 # Portrait thumbnails (256×256px)
    ├── male/
    │   └── warrior/
    │       ├── warrior_male_beginner_verylight_portrait.png
    │       ├── warrior_male_beginner_light_portrait.png
    │       └── ... (30 total)
    └── female/
        └── warrior/
            ├── warrior_female_beginner_verylight_portrait.png
            ├── warrior_female_beginner_light_portrait.png
            └── ... (30 total)
```

## Usage in Code

### Import Types and Utilities

```typescript
import { useAvatar } from '@/hooks/useAvatar';
import type { SkinTone, Gender, AvatarVariant } from '@/utils/avatarAssets';
```

### Using Full Body Avatars

**Use Case**: Avatar customization screen, character detail view, large displays

```tsx
// In a component
const avatarUrl = useAvatar(
  userId,
  'warrior',
  equipment,
  level,
  skinTone,
  gender,
  true,           // useRealAssets
  'full'          // variant - shows full body
);

return (
  <img 
    src={avatarUrl} 
    alt="Character avatar"
    className="w-64 h-96"  // 512×768 aspect ratio
  />
);
```

### Using Portrait Thumbnails

**Use Case**: Character sheet, menu icons, list views, small UI elements

```tsx
// In a component
const portraitUrl = useAvatar(
  userId,
  'warrior',
  equipment,
  level,
  skinTone,
  gender,
  true,           // useRealAssets
  'portrait'      // variant - shows head and shoulders only
);

return (
  <img 
    src={portraitUrl} 
    alt="Character portrait"
    className="w-16 h-16 rounded-full"  // Square format works great for circles
  />
);
```

### Direct Path Access

If you need to construct paths manually:

```typescript
import { getAvatarPath } from '@/utils/avatarAssets';

// Full body
const fullBodyPath = getAvatarPath('warrior', 'female', 'elite', 'medium', 'full');
// Returns: /avatars/bodies/female/warrior/warrior_female_elite_medium.png

// Portrait
const portraitPath = getAvatarPath('warrior', 'female', 'elite', 'medium', 'portrait');
// Returns: /avatars/portraits/female/warrior/warrior_female_elite_medium_portrait.png
```

## Level to Fitness Mapping

The system automatically maps character levels to fitness tiers:

| Character Level | Fitness Level | Visual Description |
|----------------|---------------|-------------------|
| 1-20 | Beginner | Slim build, minimal muscle, basic armor |
| 21-40 | Developing | Toned physique, moderate muscle, reinforced armor |
| 41-60 | Athletic | Well-defined muscles, strong build, metal-accented armor |
| 61-80 | Elite | Highly muscular, impressive definition, heavy armor |
| 81-100 | Legendary | Peak condition, heroic proportions, ornate epic armor |

## Skin Tone Options

Available skin tones (from lightest to darkest):

1. `verylight` - Very light pale skin
2. `light` - Light skin
3. `medium` - Medium olive skin
4. `tan` - Tan bronze skin
5. `dark` - Dark brown skin
6. `verydark` - Very dark deep brown skin

## Component Examples

### Character Sheet (Portrait)

```tsx
<div className="character-header flex items-center gap-4">
  <img 
    src={useAvatar(userId, classType, [], level, skinTone, gender, true, 'portrait')}
    alt="Character"
    className="w-20 h-20 rounded-full border-4 border-warrior-red"
  />
  <div>
    <h2>{characterName}</h2>
    <p>Level {level} Warrior</p>
  </div>
</div>
```

### Avatar Customization Dialog (Full Body)

```tsx
<div className="avatar-preview">
  <img 
    src={useAvatar(userId, classType, [], level, skinTone, gender, true, 'full')}
    alt="Full character preview"
    className="w-full max-w-md mx-auto"
  />
</div>
```

### Avatar Selection Grid (Portraits)

```tsx
<div className="grid grid-cols-6 gap-2">
  {skinTones.map(tone => (
    <button 
      key={tone}
      onClick={() => setSkinTone(tone)}
      className="aspect-square"
    >
      <img 
        src={getAvatarPath('warrior', gender, 'athletic', tone, 'portrait')}
        alt={`${tone} skin tone`}
        className="w-full h-full rounded-lg hover:ring-2 ring-warrior-red"
      />
    </button>
  ))}
</div>
```

## Performance Considerations

### Image Optimization
- Full body avatars: ~700KB each (PNG with transparency)
- Portrait thumbnails: ~200KB each (PNG with transparency)
- All images use transparent backgrounds for flexible compositing

### Lazy Loading
For lists with many avatars, use lazy loading:

```tsx
<img 
  src={portraitUrl}
  loading="lazy"
  alt="Character portrait"
/>
```

### Caching
Browsers will automatically cache avatar images. The file paths are deterministic based on character attributes, so the same avatar will always have the same URL.

## Future Expansion

### Planned Classes
- Scout (stealth/agility focus)
- Endurance Athlete (cardio/stamina focus)
- Monk (flexibility/balance focus)
- Hybrid Fighter (mixed training)
- Survivor (all-around fitness)

Each class will have:
- 30 full body avatars (5 fitness × 6 skin tones)
- 30 portrait thumbnails (5 fitness × 6 skin tones)

### Total Asset Plan
- **6 classes** × **2 genders** × **5 fitness levels** × **6 skin tones** × **2 variants**
- **= 720 total avatar assets**

## Troubleshooting

### Image Not Loading

1. Check the file path is correct:
```typescript
console.log(getAvatarPath('warrior', 'female', 'elite', 'medium', 'portrait'));
```

2. Verify the file exists in `/public/avatars/`

3. Check browser console for 404 errors

### Wrong Variant Showing

Make sure you're passing the correct variant parameter:
- `'full'` for full body (default)
- `'portrait'` for head and shoulders

### Aspect Ratio Issues

- Full body: Use 2:3 aspect ratio (e.g., `w-64 h-96` or `w-32 h-48`)
- Portrait: Use 1:1 aspect ratio (e.g., `w-16 h-16` or `w-24 h-24`)

## API Reference

### `useAvatar` Hook

```typescript
useAvatar(
  userId: string,
  classType?: string,          // default: 'warrior'
  equipment?: any[],           // default: []
  level?: number,              // default: 1
  skinTone?: SkinTone,         // default: 'medium'
  gender?: Gender,             // default: 'male'
  useRealAssets?: boolean,     // default: true
  variant?: AvatarVariant      // default: 'full'
): string
```

### `getAvatarPath` Function

```typescript
getAvatarPath(
  classType: ClassType,
  gender: Gender,
  fitnessLevel: FitnessLevel,
  skinTone: SkinTone,
  variant?: AvatarVariant      // default: 'full'
): string
```

### `getAvatarAsset` Function

```typescript
getAvatarAsset(
  level: number,
  classType: string,
  skinTone?: SkinTone,         // default: 'medium'
  gender?: Gender,             // default: 'male'
  variant?: AvatarVariant      // default: 'full'
): string
```

---

*Last Updated: October 15, 2025*
*Avatar System Version: 1.0*

