import { StoryCard } from "@/components/StoryCardViewer";

export interface ChapterData {
  id: number;
  title: string;
  act: string;
  requirement: string;
  boss: string | null;
  preview: string;
  cards: StoryCard[];
}

export const STORY_CHAPTERS: ChapterData[] = [
  {
    id: 1,
    title: "The Bunker",
    act: "Act 1: Awakening",
    requirement: "Complete 1 workout",
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
    requirement: "Complete 1 workout",
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
    requirement: "Complete 2 strength workouts",
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
    requirement: "Complete 1 cardio workout",
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
    requirement: "Complete 3 workouts (any type)",
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

