import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Zap, Wind, Heart, Brain, Shuffle, Footprints } from "lucide-react";

const CLASSES = [
  {
    id: "warrior",
    name: "Warrior",
    tagline: "Strength training builds raw power",
    icon: Zap,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    stats: { strength: 15, agility: 8, endurance: 12, focus: 8, resourcefulness: 7 },
    description: "Focuses on weightlifting and resistance training. High strength, moderate endurance.",
  },
  {
    id: "scout",
    name: "Scout",
    tagline: "Cardio develops speed and agility",
    icon: Wind,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    stats: { strength: 7, agility: 15, endurance: 12, focus: 8, resourcefulness: 8 },
    description: "Masters of running and cardio. High agility, excellent endurance.",
  },
  {
    id: "endurance_athlete",
    name: "Endurance Athlete",
    tagline: "Cycling/rowing creates stamina masters",
    icon: Heart,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    stats: { strength: 10, agility: 10, endurance: 15, focus: 8, resourcefulness: 7 },
    description: "Specializes in cycling, rowing, and long-distance. Exceptional endurance and stamina.",
  },
  {
    id: "monk",
    name: "Monk",
    tagline: "Yoga/flexibility brings inner focus",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    stats: { strength: 7, agility: 12, endurance: 10, focus: 15, resourcefulness: 6 },
    description: "Masters yoga, tai chi, and flexibility. High focus and mental clarity.",
  },
  {
    id: "hybrid",
    name: "Hybrid Fighter",
    tagline: "Variety is the path to mastery",
    icon: Shuffle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    stats: { strength: 10, agility: 10, endurance: 10, focus: 10, resourcefulness: 10 },
    description: "Balanced across all exercise types. Jack-of-all-trades with diverse abilities.",
  },
  {
    id: "survivor",
    name: "Survivor",
    tagline: "Daily steps forge resilience",
    icon: Footprints,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    stats: { strength: 8, agility: 9, endurance: 11, focus: 7, resourcefulness: 15 },
    description: "Focused on walking and daily activity. High resourcefulness and adaptability.",
  },
];

interface CharacterCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCharacterCreated: () => void;
}

export const CharacterCreationDialog = ({
  open,
  onOpenChange,
  onCharacterCreated,
}: CharacterCreationDialogProps) => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreateCharacter = async () => {
    if (!selectedClass || !user) return;

    setCreating(true);
    try {
      const classData = CLASSES.find((c) => c.id === selectedClass);
      if (!classData) return;

      // Create character
      const { error } = await supabase.from("characters").insert({
        user_id: user.id,
        class_type: selectedClass,
        strength: classData.stats.strength,
        agility: classData.stats.agility,
        endurance: classData.stats.endurance,
        focus: classData.stats.focus,
        resourcefulness: classData.stats.resourcefulness,
      });

      if (error) throw error;

      // Create story progress
      await supabase.from("story_progress").insert({
        user_id: user.id,
      });

      toast.success(`Welcome, ${classData.name}! Your journey begins.`);
      onCharacterCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating character:", error);
      toast.error("Failed to create character");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Path</DialogTitle>
          <p className="text-muted-foreground">
            Select a class that matches your fitness journey. You can develop a secondary class later.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {CLASSES.map((classData) => {
            const Icon = classData.icon;
            const isSelected = selectedClass === classData.id;

            return (
              <Card
                key={classData.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedClass(classData.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-lg ${classData.bgColor}`}>
                    <Icon className={`h-6 w-6 ${classData.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{classData.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {classData.tagline}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {classData.description}
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div>💪 STR: {classData.stats.strength}</div>
                      <div>⚡ AGI: {classData.stats.agility}</div>
                      <div>❤️ END: {classData.stats.endurance}</div>
                      <div>🧠 FOC: {classData.stats.focus}</div>
                      <div>🎯 RES: {classData.stats.resourcefulness}</div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={handleCreateCharacter}
            disabled={!selectedClass || creating}
            size="lg"
          >
            {creating ? "Creating..." : "Begin Journey"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
