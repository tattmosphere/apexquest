import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Character {
  id: string;
  user_id: string;
  class_type: string;
  secondary_class: string | null;
  xp: number;
  strength: number;
  agility: number;
  endurance: number;
  focus: number;
  resourcefulness: number;
  survival_credits: number;
  created_at: string;
  updated_at: string;
}

export const useCharacter = () => {
  const { user } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCharacter(null);
      setLoading(false);
      return;
    }

    const fetchCharacter = async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching character:", error);
      } else {
        setCharacter(data);
      }
      setLoading(false);
    };

    fetchCharacter();

    // Subscribe to character changes
    const channel = supabase
      .channel("character-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "characters",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setCharacter(payload.new as Character);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const calculateLevel = (xp: number): number => {
    if (xp < 1000) return Math.floor(xp / 100) + 1;
    if (xp < 5000) return Math.floor((xp - 1000) / 250) + 11;
    return Math.floor((xp - 5000) / 500) + 27;
  };

  const getXPForNextLevel = (xp: number): number => {
    if (xp < 1000) return ((Math.floor(xp / 100) + 1) * 100);
    if (xp < 5000) return 1000 + ((Math.floor((xp - 1000) / 250) + 1) * 250);
    return 5000 + ((Math.floor((xp - 5000) / 500) + 1) * 500);
  };

  const level = character ? calculateLevel(character.xp) : 1;
  const xpForNextLevel = character ? getXPForNextLevel(character.xp) : 100;
  const xpProgress = character ? ((character.xp % (level < 10 ? 100 : level < 26 ? 250 : 500)) / (level < 10 ? 100 : level < 26 ? 250 : 500)) * 100 : 0;

  return { 
    character, 
    loading, 
    level,
    xpForNextLevel,
    xpProgress,
    setCharacter
  };
};
