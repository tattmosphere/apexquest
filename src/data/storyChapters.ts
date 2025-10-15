import { StoryCard } from "@/components/StoryCardViewer";

export type ChapterRequirementType = 
  | "workout_count"
  | "strength_progression"
  | "cardio_distance"
  | "cardio_time"
  | "endurance_hold"
  | "streak_days"
  | "total_volume"
  | "specific_exercise";

export interface ChapterRequirement {
  type: ChapterRequirementType;
  description: string;
  // Class-specific variants
  warrior?: string;  // For strength-focused users
  rogue?: string;    // For cardio/agility-focused users
  mage?: string;     // For flexibility/endurance-focused users
  // Tracking data
  target?: number;
  exercise?: string;
  metric?: string;
}

export interface ChapterData {
  id: number;
  title: string;
  act: string;
  requirement: ChapterRequirement;
  boss: string | null;
  preview: string;
  cards: StoryCard[];
}

export const STORY_CHAPTERS: ChapterData[] = [
  {
    id: 1,
    title: "The Bunker",
    act: "Act 1: Awakening",
    requirement: {
      type: "workout_count",
      description: "Complete your first workout",
      warrior: "Complete 1 strength training session",
      rogue: "Complete 1 cardio session",
      mage: "Complete 1 flexibility or yoga session",
      target: 1
    },
    boss: null,
    preview: "You wake in darkness. The world has ended. It's time to survive.",
    cards: [
      {
        type: "story",
        image: "/story/chapter1/scene1.png",
        title: "Day 2,847",
        text: "You wake in darkness. Your head throbs. The air is stale, recycled. Emergency lighting flickers to life, revealing a small underground chamber—a survival bunker. A holographic display activates: 'STASIS POD MALFUNCTION. EMERGENCY WAKE PROTOCOL INITIATED. DAY 2,847 SINCE COLLAPSE.' Nearly eight years."
      },
      {
        type: "story",
        image: "/story/chapter1/scene2.png",
        title: "Muscle Memory",
        text: "You don't remember entering stasis. You don't remember the collapse. But your body remembers something—muscle memory kicks in as you test your limbs. You're weak, but functional. Your muscles are atrophied, but you can feel the strength returning. You need to rebuild."
      },
      {
        type: "story",
        image: "/story/chapter1/scene3.png",
        title: "Surface Conditions",
        text: "The bunker's computer offers basic information: The surface is hostile but survivable. Supplies are limited. Food, water, and medical resources are running low. Temperature: -23.7°C. Radiation levels: Moderate. You must venture out."
      },
      {
        type: "story",
        image: "/story/chapter1/scene4.png",
        title: "First Steps",
        text: "You stand at the airlock, makeshift weapon in hand. Light seeps through the cracks. Beyond this door lies a world you don't remember—a world that ended while you slept. But you're a survivor. And survivors don't give up. It's time to face the wasteland."
      },
      {
        type: "rewards",
        text: "You've completed your first workout and begun your journey. Your body is awakening, your strength returning.",
        rewards: {
          xp: 250,
          credits: 100,
          abilities: [],
          equipment: ["Makeshift Pipe"],
          achievements: ["First Steps"]
        }
      }
    ]
  },
  {
    id: 2,
    title: "First Light",
    act: "Act 1: Awakening",
    requirement: {
      type: "streak_days",
      description: "Maintain a 3-day workout streak",
      warrior: "Complete strength workouts 3 days in a row",
      rogue: "Complete cardio sessions 3 days in a row",
      mage: "Complete flexibility workouts 3 days in a row",
      target: 3
    },
    boss: null,
    preview: "The surface awaits. You're not alone in the wasteland.",
    cards: [
      {
        type: "story",
        text: "Chapter 2 story cards coming soon...",
        rewards: {
          xp: 300,
          credits: 150,
          abilities: [],
          equipment: [],
          achievements: []
        }
      }
    ]
  },
  {
    id: 3,
    title: "The Raider Camp",
    act: "Act 1: Awakening",
    requirement: {
      type: "strength_progression",
      description: "Show strength progression",
      warrior: "Increase weight on any compound lift by 10 lbs",
      rogue: "Complete 50 burpees in one session",
      mage: "Hold plank position for 2 minutes",
      target: 10,
      metric: "lbs"
    },
    boss: "Ironjaw (Raider Leader)",
    preview: "Raiders control the supply depot. You'll need strength to take them on.",
    cards: [
      {
        type: "story",
        text: "Chapter 3 story cards coming soon...",
        rewards: {
          xp: 500,
          credits: 250,
          abilities: ["Power Strike"],
          equipment: ["Raider Armor"],
          achievements: ["Ironjaw Defeated"]
        }
      }
    ]
  },
  {
    id: 4,
    title: "The Safe Haven",
    act: "Act 1: Awakening",
    requirement: {
      type: "cardio_distance",
      description: "Build endurance for the journey",
      warrior: "Complete a 2-mile run or walk",
      rogue: "Complete a 5k run under 35 minutes",
      mage: "Walk 15,000 steps in one day",
      target: 5,
      metric: "km"
    },
    boss: null,
    preview: "Raven leads you to a survivor settlement. But can they be trusted?",
    cards: [
      {
        type: "story",
        text: "Chapter 4 story cards coming soon...",
        rewards: {
          xp: 400,
          credits: 200,
          abilities: [],
          equipment: [],
          achievements: []
        }
      }
    ]
  },
  {
    id: 5,
    title: "The Horde",
    act: "Act 2: Rising Threat",
    requirement: {
      type: "total_volume",
      description: "Prepare for the ultimate battle",
      warrior: "Complete 5 strength workouts with progressive overload",
      rogue: "Run a total of 15 miles across multiple sessions",
      mage: "Complete 300 minutes of yoga/flexibility training",
      target: 5
    },
    boss: "Bloater (Mutant Boss)",
    preview: "A massive horde approaches the settlement. Prepare for battle.",
    cards: [
      {
        type: "story",
        text: "Chapter 5 story cards coming soon...",
        rewards: {
          xp: 750,
          credits: 400,
          abilities: ["Horde Breaker"],
          equipment: ["Reinforced Armor"],
          achievements: ["Horde Survivor"]
        }
      }
    ]
  }
];

export const getChapter = (chapterId: number): ChapterData | undefined => {
  return STORY_CHAPTERS.find(chapter => chapter.id === chapterId);
};

// Helper function to get requirement text based on user's class
export const getRequirementForClass = (requirement: ChapterRequirement, userClass: string): string => {
  const classLower = userClass.toLowerCase();
  
  if (classLower === 'warrior' && requirement.warrior) {
    return requirement.warrior;
  } else if (classLower === 'rogue' && requirement.rogue) {
    return requirement.rogue;
  } else if (classLower === 'mage' && requirement.mage) {
    return requirement.mage;
  }
  
  // Fallback to generic description
  return requirement.description;
};

