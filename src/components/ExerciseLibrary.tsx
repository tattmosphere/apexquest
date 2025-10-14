import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Dumbbell, Target, Zap } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  category: string;
  primary_muscle_group: string | null;
  equipment_needed: string | null;
  difficulty_level: string | null;
  met_value: number | null;
  typical_rep_range: string | null;
  typical_set_range: string | null;
}

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Forearms", "Quads", "Hamstrings", "Calves", "Glutes", "Abs", "Cardio"];
const EQUIPMENT_TYPES = ["All", "Barbell", "Dumbbell", "Cable/Machine", "Machine", "Body Weight", "None"];
const DIFFICULTY_LEVELS = ["All", "beginner", "intermediate", "advanced"];

export function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("All");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchExercises();
  }, [searchQuery, muscleFilter, equipmentFilter, difficultyFilter]);

  const searchExercises = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("exercises")
        .select("*")
        .order("name");

      if (searchQuery) {
        query = query.textSearch("search_vector", searchQuery);
      }

      if (muscleFilter !== "All") {
        query = query.eq("primary_muscle_group", muscleFilter);
      }

      if (equipmentFilter !== "All") {
        query = query.eq("equipment_needed", equipmentFilter);
      }

      if (difficultyFilter !== "All") {
        query = query.eq("difficulty_level", difficultyFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error("Error searching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "beginner": return "bg-success/20 text-success";
      case "intermediate": return "bg-warning/20 text-warning";
      case "advanced": return "bg-destructive/20 text-destructive";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={muscleFilter} onValueChange={setMuscleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Muscle Group" />
            </SelectTrigger>
            <SelectContent>
              {MUSCLE_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Equipment" />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {loading ? "Searching..." : `${exercises.length} exercises found`}
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="p-4 hover:border-primary transition-colors">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">{exercise.name}</h3>
                  {exercise.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {exercise.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {exercise.primary_muscle_group && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {exercise.primary_muscle_group}
                    </Badge>
                  )}
                  
                  {exercise.difficulty_level && (
                    <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                      <Zap className="h-3 w-3 mr-1" />
                      {exercise.difficulty_level}
                    </Badge>
                  )}

                  {exercise.equipment_needed && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Dumbbell className="h-3 w-3" />
                      {exercise.equipment_needed}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {exercise.typical_set_range && exercise.typical_rep_range && (
                    <span>{exercise.typical_set_range} sets × {exercise.typical_rep_range} reps</span>
                  )}
                  {exercise.met_value && (
                    <span>{exercise.met_value} MET</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
