import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

interface StoryOnboardingProps {
  open: boolean;
  onComplete: (characterData: {
    name: string;
    class: string;
    gender: string;
    skinTone: string;
    fitnessLevel: string;
  }) => void;
}

const SKIN_TONES = [
  { id: "verylight", label: "Very Light", color: "#FFE0BD" },
  { id: "light", label: "Light", color: "#F1C27D" },
  { id: "medium", label: "Medium", color: "#C68642" },
  { id: "tan", label: "Tan", color: "#8D5524" },
  { id: "dark", label: "Dark", color: "#5C4033" },
  { id: "verydark", label: "Very Dark", color: "#3B2F2F" },
];

const FITNESS_LEVELS = [
  { id: "beginner", label: "Beginner", description: "Just starting my fitness journey" },
  { id: "developing", label: "Developing", description: "Working out occasionally" },
  { id: "athletic", label: "Athletic", description: "Regular training routine" },
  { id: "elite", label: "Elite", description: "Advanced fitness level" },
  { id: "legendary", label: "Legendary", description: "Peak physical condition" },
];

const CLASSES = [
  {
    id: "warrior",
    name: "Warrior",
    description: "Masters of strength training and raw power. Build muscle through lifting and resistance training.",
    icon: "⚔️",
  },
  {
    id: "rogue",
    name: "Rogue",
    description: "Experts in cardio, speed, and agility. Excel at running, HIIT, and endurance challenges.",
    icon: "🏃",
  },
  {
    id: "mage",
    name: "Mage",
    description: "Focused on flexibility, balance, and endurance. Master yoga, stretching, and mind-body connection.",
    icon: "🧘",
  },
];

export function StoryOnboarding({ open, onComplete }: StoryOnboardingProps) {
  const [step, setStep] = useState(0);
  const [characterData, setCharacterData] = useState({
    name: "",
    class: "",
    gender: "male",
    skinTone: "medium",
    fitnessLevel: "beginner",
  });

  const storySteps = [
    {
      type: "story",
      image: "/story/chapter1/scene1.png",
      title: "Day 2,847",
      text: "You wake in darkness. Your head throbs. The air is stale, recycled. Emergency lighting flickers to life, revealing a small underground chamber—a survival bunker. A holographic display activates: 'STASIS POD MALFUNCTION. EMERGENCY WAKE PROTOCOL INITIATED. DAY 2,847 SINCE COLLAPSE.' Nearly eight years.",
    },
    {
      type: "story",
      image: "/story/chapter1/scene2.png",
      title: "Testing Your Limits",
      text: "You test your limbs. Weak. Atrophied. The stasis pod kept you alive, but your body has paid the price. Years of inactivity have left you vulnerable. In this new world, weakness means death.",
      prompt: "How would you describe your current fitness level?",
      field: "fitnessLevel",
    },
    {
      type: "story",
      image: "/story/chapter1/scene3.png",
      title: "Choose Your Path",
      text: "The terminal displays three training protocols from the old world. Each path offers a different approach to survival. Strength to overpower threats. Speed to outrun danger. Flexibility to adapt and endure. Which will you master?",
      prompt: "Select your training path:",
      field: "class",
    },
    {
      type: "story",
      image: "/story/chapter1/scene4.png",
      title: "Your Identity",
      text: "You approach the airlock, catching your reflection in the reinforced glass. This is who you are. This is who you'll become. The wasteland awaits, and only the strong survive.",
      prompt: "Customize your survivor:",
      field: "identity",
    },
    {
      type: "completion",
      image: "/story/chapter1/scene4.png",
      title: "Achievement Unlocked: Awakened",
      text: "You've taken your first steps in the wasteland. Your journey begins now. Complete your first workout to unlock Chapter 2: First Light.",
    },
  ];

  const currentStep = storySteps[step];

  const handleNext = () => {
    if (step < storySteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(characterData);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (currentStep.field === "fitnessLevel") {
      return characterData.fitnessLevel !== "";
    }
    if (currentStep.field === "class") {
      return characterData.class !== "";
    }
    if (currentStep.field === "identity") {
      return characterData.name.trim() !== "";
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onComplete(characterData)}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-background border-primary" aria-describedby="story-onboarding-description">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${currentStep.image})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50" />
            </div>

            {/* Content */}
              <div className="relative z-10 flex flex-col h-full min-h-[600px] p-8">
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-white hover:bg-white/10"
                    aria-label="Close onboarding"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DialogClose>
                {/* Header */}
              <div className="mb-6">
                <div className="inline-block px-3 py-1 mb-2 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
                  Chapter 1: The Bunker
                </div>
                <DialogTitle id="story-onboarding-title" className="text-3xl font-bold text-white drop-shadow-lg">
                  {currentStep.title}
                </DialogTitle>
                <DialogDescription id="story-onboarding-description" className="sr-only">
                  Story onboarding for Chapter 1: The Bunker
                </DialogDescription>
              </div>

              {/* Story Text */}
              <div className="flex-1 mb-6">
                <p className="text-lg text-white/90 leading-relaxed drop-shadow-md mb-6">
                  {currentStep.text}
                </p>

                {/* Interactive Fields */}
                {currentStep.field === "fitnessLevel" && (
                  <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 border border-primary/30">
                    <Label className="text-lg font-semibold mb-4 block">
                      {currentStep.prompt}
                    </Label>
                    <RadioGroup
                      value={characterData.fitnessLevel}
                      onValueChange={(value) =>
                        setCharacterData({ ...characterData, fitnessLevel: value })
                      }
                      className="space-y-3"
                    >
                      {FITNESS_LEVELS.map((level) => (
                        <div
                          key={level.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <RadioGroupItem value={level.id} id={level.id} />
                          <Label htmlFor={level.id} className="flex-1 cursor-pointer">
                            <div className="font-semibold">{level.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {level.description}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {currentStep.field === "class" && (
                  <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 border border-primary/30">
                    <Label className="text-lg font-semibold mb-4 block">
                      {currentStep.prompt}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {CLASSES.map((classOption) => (
                        <button
                          key={classOption.id}
                          onClick={() =>
                            setCharacterData({ ...characterData, class: classOption.id })
                          }
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            characterData.class === classOption.id
                              ? "border-primary bg-primary/20"
                              : "border-border hover:border-primary/50 bg-card/50"
                          }`}
                        >
                          <div className="text-3xl mb-2">{classOption.icon}</div>
                          <div className="font-bold text-lg mb-1">{classOption.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {classOption.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep.field === "identity" && (
                  <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 border border-primary/30 space-y-6">
                    <Label className="text-lg font-semibold block">
                      {currentStep.prompt}
                    </Label>

                    {/* Name */}
                    <div>
                      <Label htmlFor="name" className="mb-2 block">
                        Survivor Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter your name..."
                        value={characterData.name}
                        onChange={(e) =>
                          setCharacterData({ ...characterData, name: e.target.value })
                        }
                        className="bg-background/50"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <Label className="mb-2 block">Gender</Label>
                      <RadioGroup
                        value={characterData.gender}
                        onValueChange={(value) =>
                          setCharacterData({ ...characterData, gender: value })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Skin Tone */}
                    <div>
                      <Label className="mb-3 block">Skin Tone</Label>
                      <div className="grid grid-cols-6 gap-3">
                        {SKIN_TONES.map((tone) => (
                          <button
                            key={tone.id}
                            onClick={() =>
                              setCharacterData({ ...characterData, skinTone: tone.id })
                            }
                            className={`aspect-square rounded-lg border-2 transition-all ${
                              characterData.skinTone === tone.id
                                ? "border-primary scale-110"
                                : "border-border hover:border-primary/50"
                            }`}
                            style={{ backgroundColor: tone.color }}
                            title={tone.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep.type === "completion" && (
                  <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 border-2 border-primary text-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <div className="text-2xl font-bold text-primary mb-2">
                      Achievement Unlocked!
                    </div>
                    <div className="text-lg font-semibold mb-2">Awakened</div>
                    <div className="text-sm text-muted-foreground">
                      +100 XP • +50 SC
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 0}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex gap-2">
                  {storySteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === step
                          ? "w-8 bg-primary"
                          : index < step
                          ? "w-2 bg-primary/50"
                          : "w-2 bg-white/20"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {step === storySteps.length - 1 ? "Begin Journey" : "Continue"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

