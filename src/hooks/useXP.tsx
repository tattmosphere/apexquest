import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export const useXP = () => {
  const { profile } = useProfile();

  const awardWorkoutXP = async (
    userId: string,
    workoutData: {
      duration_minutes: number;
      category: string;
      exercises: any[];
    }
  ): Promise<{ xpGained: number; newLevel: number; leveledUp: boolean }> => {
    try {
      // Base XP calculation
      const baseXP = Math.floor(workoutData.duration_minutes * 10);

      // Get character and equipped abilities
      const { data: character } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!character) {
        throw new Error("Character not found");
      }

      const { data: userAbilities } = await supabase
        .from("user_abilities")
        .select("abilities(*)")
        .eq("user_id", userId)
        .eq("equipped", true);

      let multiplier = 1.0;

      // Apply ability effects
      if (userAbilities) {
        for (const ua of userAbilities) {
          const ability = ua.abilities as any;
          
          if (ability.effect_type === "xp_boost") {
            // Class-specific XP boosts
            if (ability.class_type === character.class_type) {
              multiplier += ability.effect_value;
            }
            // Check if it's a general XP boost
            if (ability.name === "Adapt") {
              multiplier += ability.effect_value;
            }
          }

          if (ability.effect_type === "workout_multiplier") {
            // Check if conditions are met
            if (ability.name === "Berserker" && profile?.current_streak >= 7) {
              multiplier += ability.effect_value;
            }
            if (ability.name === "Unbreakable Will" && workoutData.duration_minutes >= 45) {
              multiplier = ability.effect_value;
            }
          }
        }
      }

      // Streak bonus
      if (profile?.current_streak >= 30) {
        multiplier *= 2;
      } else if (profile?.current_streak >= 7) {
        multiplier *= 1.5;
      }

      const totalXP = Math.floor(baseXP * multiplier);
      const oldLevel = calculateLevel(character.xp);
      const newXP = character.xp + totalXP;
      const newLevel = calculateLevel(newXP);

      // Update character XP
      await supabase
        .from("characters")
        .update({ xp: newXP })
        .eq("user_id", userId);

      // Update profile level
      await supabase
        .from("profiles")
        .update({ 
          level: newLevel, 
          total_points: newLevel * 100 
        })
        .eq("id", userId);

      return {
        xpGained: totalXP,
        newLevel,
        leveledUp: newLevel > oldLevel,
      };
    } catch (error) {
      console.error("Error awarding XP:", error);
      return { xpGained: 0, newLevel: 1, leveledUp: false };
    }
  };

  const updateCharacterStats = async (
    userId: string,
    workoutData: {
      category: string;
      exercises: any[];
    }
  ): Promise<void> => {
    try {
      let str = 0, agi = 0, end = 0, foc = 0, res = 0;

      // Analyze exercises in workout
      workoutData.exercises.forEach((ex: any) => {
        const category = ex.category?.toLowerCase() || '';
        const muscle = ex.primary_muscle_group?.toLowerCase() || '';
        const name = ex.name?.toLowerCase() || '';

        if (
          category === "strength" ||
          ["chest", "back", "legs", "shoulders", "arms"].includes(muscle)
        ) {
          str += 3;
          end += 1;
        } else if (category === "cardio" || muscle === "cardiovascular") {
          agi += 3;
          end += 2;
        } else if (
          name.includes("cycling") ||
          name.includes("rowing") ||
          name.includes("erg") ||
          category === "endurance"
        ) {
          end += 3;
          agi += 1;
          str += 1;
        } else if (
          ["yoga", "pilates", "stretching", "flexibility"].includes(category)
        ) {
          foc += 3;
          agi += 2;
        } else {
          // Default for unknown exercises
          res += 1;
        }
      });

      // Apply to database
      await supabase.rpc("increment_character_stats", {
        p_user_id: userId,
        p_strength: str,
        p_agility: agi,
        p_endurance: end,
        p_focus: foc,
        p_resourcefulness: res,
      });
    } catch (error) {
      console.error("Error updating character stats:", error);
    }
  };

  return {
    awardWorkoutXP,
    updateCharacterStats,
  };
};

const calculateLevel = (xp: number): number => {
  if (xp < 1000) return Math.floor(xp / 100) + 1;
  if (xp < 5000) return Math.floor((xp - 1000) / 250) + 11;
  return Math.floor((xp - 5000) / 500) + 27;
};
