import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface DailyQuest {
  id: string;
  user_id: string;
  quest_date: string;
  quest_type: string;
  target_value: number;
  current_progress: number;
  completed: boolean;
  xp_reward: number;
  credits_reward: number;
}

export const useDailyQuests = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchTodayQuests();

    // Subscribe to quest changes
    const channel = supabase
      .channel("quest-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_quests",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTodayQuests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchTodayQuests = async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_quests")
      .select("*")
      .eq("user_id", user.id)
      .eq("quest_date", today)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching quests:", error);
    } else {
      setQuests(data || []);
      
      // Generate quests if none exist for today
      if (!data || data.length === 0) {
        await generateDailyQuests(user.id);
      }
    }
    setLoading(false);
  };

  const generateDailyQuests = async (userId: string): Promise<void> => {
    const questTemplates = [
      { type: "complete_workout", target: 1, xp: 100, credits: 50 },
      { type: "walk_steps", target: 10000, xp: 150, credits: 75 },
      { type: "strength_workout", target: 1, xp: 200, credits: 100 },
      { type: "cardio_workout", target: 1, xp: 200, credits: 100 },
      { type: "endurance_workout", target: 1, xp: 200, credits: 100 },
      { type: "flexibility_workout", target: 1, xp: 180, credits: 90 },
      { type: "beat_pr", target: 1, xp: 500, credits: 250 },
      { type: "maintain_streak", target: 1, xp: 300, credits: 150 },
      { type: "workout_30min", target: 1, xp: 250, credits: 125 },
      { type: "workout_45min", target: 1, xp: 350, credits: 175 },
    ];

    // Random 3 quests
    const selected = questTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const today = new Date().toISOString().split("T")[0];

    for (const quest of selected) {
      await supabase.from("daily_quests").insert({
        user_id: userId,
        quest_type: quest.type,
        target_value: quest.target,
        xp_reward: quest.xp,
        credits_reward: quest.credits,
        quest_date: today,
      });
    }

    await fetchTodayQuests();
  };

  const updateQuestProgress = async (
    userId: string,
    workoutData: {
      category: string;
      duration_minutes: number;
      beatPR?: boolean;
    }
  ): Promise<void> => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: activeQuests } = await supabase
        .from("daily_quests")
        .select("*")
        .eq("user_id", userId)
        .eq("quest_date", today)
        .eq("completed", false);

      if (!activeQuests) return;

      for (const quest of activeQuests) {
        let increment = 0;

        switch (quest.quest_type) {
          case "complete_workout":
            increment = 1;
            break;
          case "strength_workout":
            if (workoutData.category.toLowerCase() === "strength") increment = 1;
            break;
          case "cardio_workout":
            if (workoutData.category.toLowerCase() === "cardio") increment = 1;
            break;
          case "endurance_workout":
            if (workoutData.category.toLowerCase() === "endurance") increment = 1;
            break;
          case "flexibility_workout":
            if (["flexibility", "yoga", "stretching"].includes(workoutData.category.toLowerCase())) {
              increment = 1;
            }
            break;
          case "workout_30min":
            if (workoutData.duration_minutes >= 30) increment = 1;
            break;
          case "workout_45min":
            if (workoutData.duration_minutes >= 45) increment = 1;
            break;
          case "beat_pr":
            if (workoutData.beatPR) increment = 1;
            break;
          case "maintain_streak":
            // This is checked elsewhere
            break;
        }

        if (increment > 0) {
          const newProgress = quest.current_progress + increment;
          const completed = newProgress >= quest.target_value;

          await supabase
            .from("daily_quests")
            .update({
              current_progress: newProgress,
              completed,
            })
            .eq("id", quest.id);

          if (completed) {
            // Award rewards
            await awardQuestRewards(userId, quest);
            toast.success(`Quest completed! +${quest.xp_reward} XP 🎯`);
          }
        }
      }
    } catch (error) {
      console.error("Error updating quest progress:", error);
    }
  };

  const awardQuestRewards = async (
    userId: string,
    quest: DailyQuest
  ): Promise<void> => {
    try {
      // Award XP to character
      const { data: character } = await supabase
        .from("characters")
        .select("xp")
        .eq("user_id", userId)
        .single();

      if (character) {
        const { data: char } = await supabase
          .from("characters")
          .select("survival_credits")
          .eq("user_id", userId)
          .single();
        
        await supabase
          .from("characters")
          .update({
            xp: character.xp + quest.xp_reward,
            survival_credits: (char?.survival_credits || 0) + quest.credits_reward,
          })
          .eq("user_id", userId);
      }
    } catch (error) {
      console.error("Error awarding quest rewards:", error);
    }
  };

  const getQuestLabel = (questType: string): string => {
    const labels: { [key: string]: string } = {
      complete_workout: "Complete any workout",
      walk_steps: "Walk 10,000 steps",
      strength_workout: "Complete a strength workout",
      cardio_workout: "Complete a cardio workout",
      endurance_workout: "Complete an endurance workout",
      flexibility_workout: "Complete a flexibility workout",
      beat_pr: "Beat a personal record",
      maintain_streak: "Maintain your streak",
      workout_30min: "Complete a 30+ minute workout",
      workout_45min: "Complete a 45+ minute workout",
    };
    return labels[questType] || questType;
  };

  return {
    quests,
    loading,
    updateQuestProgress,
    getQuestLabel,
  };
};
