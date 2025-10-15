import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCharacter } from "./useCharacter";
import { toast } from "sonner";

export interface Ability {
  id: string;
  name: string;
  description: string;
  class_type: string;
  tier: number;
  unlock_workout_count: number;
  unlock_level: number;
  ability_type: string;
  effect_type: string;
  effect_value: number;
  icon_name: string;
}

export interface UserAbility {
  id: string;
  user_id: string;
  ability_id: string;
  equipped: boolean;
  unlocked_at: string;
  abilities: Ability;
}

export const useAbilities = () => {
  const { user } = useAuth();
  const { character, level } = useCharacter();
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [unlockedAbilities, setUnlockedAbilities] = useState<UserAbility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !character) {
      setLoading(false);
      return;
    }

    fetchAbilities();
    fetchUnlockedAbilities();
  }, [user, character]);

  const fetchAbilities = async () => {
    if (!character) return;

    const { data, error } = await supabase
      .from("abilities")
      .select("*")
      .in("class_type", [character.class_type, character.secondary_class].filter(Boolean))
      .order("tier", { ascending: true });

    if (error) {
      console.error("Error fetching abilities:", error);
    } else {
      setAbilities(data || []);
    }
  };

  const fetchUnlockedAbilities = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_abilities")
      .select("*, abilities(*)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching unlocked abilities:", error);
    } else {
      setUnlockedAbilities(data || []);
    }
    setLoading(false);
  };

  const checkAbilityUnlocks = async (userId: string): Promise<Ability[]> => {
    try {
      // Get workout counts by category
      const { data: workoutCounts } = await supabase.rpc(
        "get_workout_type_counts",
        {
          p_user_id: userId,
        }
      );

      const { data: character } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!character || !workoutCounts) return [];

      // Get total workout count
      const { data: totalCount } = await supabase.rpc(
        "get_total_workout_count",
        {
          p_user_id: userId,
        }
      );

      // Map category to workout count
      const categoryMap: { [key: string]: number } = {};
      workoutCounts.forEach((wc: { category: string; count: number }) => {
        categoryMap[wc.category.toLowerCase()] = Number(wc.count);
      });

      const strengthCount = categoryMap["strength"] || 0;
      const cardioCount = categoryMap["cardio"] || 0;
      const enduranceCount = categoryMap["endurance"] || 0;
      const flexibilityCount = categoryMap["flexibility"] || categoryMap["yoga"] || 0;

      // Determine which count to check based on class
      let relevantCount = totalCount || 0;
      if (character.class_type === "warrior") relevantCount = strengthCount;
      else if (character.class_type === "scout") relevantCount = cardioCount;
      else if (character.class_type === "endurance_athlete") relevantCount = enduranceCount;
      else if (character.class_type === "monk") relevantCount = flexibilityCount;

      const currentLevel = calculateLevel(character.xp);

      // Check which abilities should unlock
      const { data: eligibleAbilities } = await supabase
        .from("abilities")
        .select("*")
        .eq("class_type", character.class_type)
        .lte("unlock_workout_count", relevantCount)
        .lte("unlock_level", currentLevel);

      if (!eligibleAbilities) return [];

      const newlyUnlocked: Ability[] = [];

      // Insert newly unlocked abilities
      for (const ability of eligibleAbilities) {
        const { data: existing } = await supabase
          .from("user_abilities")
          .select("*")
          .eq("user_id", userId)
          .eq("ability_id", ability.id)
          .single();

        if (!existing) {
          await supabase.from("user_abilities").insert({
            user_id: userId,
            ability_id: ability.id,
            equipped: ability.ability_type === "passive", // Auto-equip passives
          });

          newlyUnlocked.push(ability);

          toast.success(
            `🎉 New Ability Unlocked: ${ability.name}`,
            {
              description: ability.description,
              duration: 5000,
            }
          );
        }
      }

      // Refresh unlocked abilities
      await fetchUnlockedAbilities();

      return newlyUnlocked;
    } catch (error) {
      console.error("Error checking ability unlocks:", error);
      return [];
    }
  };

  const toggleEquipAbility = async (abilityId: string): Promise<void> => {
    if (!user) return;

    const ability = unlockedAbilities.find((ua) => ua.ability_id === abilityId);
    if (!ability) return;

    const { error } = await supabase
      .from("user_abilities")
      .update({ equipped: !ability.equipped })
      .eq("user_id", user.id)
      .eq("ability_id", abilityId);

    if (error) {
      console.error("Error toggling ability:", error);
      toast.error("Failed to equip ability");
    } else {
      toast.success(ability.equipped ? "Ability unequipped" : "Ability equipped");
      await fetchUnlockedAbilities();
    }
  };

  return {
    abilities,
    unlockedAbilities,
    loading,
    checkAbilityUnlocks,
    toggleEquipAbility,
  };
};

const calculateLevel = (xp: number): number => {
  if (xp < 1000) return Math.floor(xp / 100) + 1;
  if (xp < 5000) return Math.floor((xp - 1000) / 250) + 11;
  return Math.floor((xp - 5000) / 500) + 27;
};
