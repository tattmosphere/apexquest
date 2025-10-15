export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abilities: {
        Row: {
          ability_type: string
          class_type: string
          created_at: string
          description: string
          effect_type: string
          effect_value: number
          icon_name: string
          id: string
          name: string
          tier: number
          unlock_level: number
          unlock_workout_count: number
        }
        Insert: {
          ability_type: string
          class_type: string
          created_at?: string
          description: string
          effect_type: string
          effect_value: number
          icon_name: string
          id?: string
          name: string
          tier: number
          unlock_level: number
          unlock_workout_count: number
        }
        Update: {
          ability_type?: string
          class_type?: string
          created_at?: string
          description?: string
          effect_type?: string
          effect_value?: number
          icon_name?: string
          id?: string
          name?: string
          tier?: number
          unlock_level?: number
          unlock_workout_count?: number
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon_name: string | null
          id: string
          points: number
          title: string
          unlock_criteria: Json
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon_name?: string | null
          id?: string
          points?: number
          title: string
          unlock_criteria: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon_name?: string | null
          id?: string
          points?: number
          title?: string
          unlock_criteria?: Json
        }
        Relationships: []
      }
      characters: {
        Row: {
          agility: number
          class_type: string
          created_at: string
          endurance: number
          focus: number
          id: string
          resourcefulness: number
          secondary_class: string | null
          strength: number
          survival_credits: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          agility?: number
          class_type: string
          created_at?: string
          endurance?: number
          focus?: number
          id?: string
          resourcefulness?: number
          secondary_class?: string | null
          strength?: number
          survival_credits?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          agility?: number
          class_type?: string
          created_at?: string
          endurance?: number
          focus?: number
          id?: string
          resourcefulness?: number
          secondary_class?: string | null
          strength?: number
          survival_credits?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "characters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quests: {
        Row: {
          completed: boolean
          created_at: string
          credits_reward: number
          current_progress: number
          id: string
          quest_date: string
          quest_type: string
          target_value: number
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          credits_reward: number
          current_progress?: number
          id?: string
          quest_date?: string
          quest_type: string
          target_value: number
          user_id: string
          xp_reward: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          credits_reward?: number
          current_progress?: number
          id?: string
          quest_date?: string
          quest_type?: string
          target_value?: number
          user_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_quests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          equipment_needed: string | null
          id: string
          intensity_level: string | null
          is_custom: boolean | null
          met_value: number | null
          muscle_groups: string[]
          name: string
          primary_muscle_group: string | null
          recommended_rest_seconds: number | null
          search_vector: unknown | null
          secondary_muscle_groups: string[] | null
          supports_distance: boolean | null
          supports_reps: boolean | null
          supports_sets: boolean | null
          supports_time: boolean | null
          supports_weight: boolean | null
          thumbnail_url: string | null
          typical_rep_range: string | null
          typical_set_range: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          equipment_needed?: string | null
          id?: string
          intensity_level?: string | null
          is_custom?: boolean | null
          met_value?: number | null
          muscle_groups?: string[]
          name: string
          primary_muscle_group?: string | null
          recommended_rest_seconds?: number | null
          search_vector?: unknown | null
          secondary_muscle_groups?: string[] | null
          supports_distance?: boolean | null
          supports_reps?: boolean | null
          supports_sets?: boolean | null
          supports_time?: boolean | null
          supports_weight?: boolean | null
          thumbnail_url?: string | null
          typical_rep_range?: string | null
          typical_set_range?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          equipment_needed?: string | null
          id?: string
          intensity_level?: string | null
          is_custom?: boolean | null
          met_value?: number | null
          muscle_groups?: string[]
          name?: string
          primary_muscle_group?: string | null
          recommended_rest_seconds?: number | null
          search_vector?: unknown | null
          secondary_muscle_groups?: string[] | null
          supports_distance?: boolean | null
          supports_reps?: boolean | null
          supports_sets?: boolean | null
          supports_time?: boolean | null
          supports_weight?: boolean | null
          thumbnail_url?: string | null
          typical_rep_range?: string | null
          typical_set_range?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hidden_workouts: {
        Row: {
          hidden_at: string
          id: string
          user_id: string
          workout_id: string
        }
        Insert: {
          hidden_at?: string
          id?: string
          user_id: string
          workout_id: string
        }
        Update: {
          hidden_at?: string
          id?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: []
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          record_type: string
          session_id: string | null
          user_id: string
          value: number
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          record_type: string
          session_id?: string | null
          user_id: string
          value: number
        }
        Update: {
          achieved_at?: string
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          record_type?: string
          session_id?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          body_weight_kg: number | null
          body_weight_lbs: number | null
          created_at: string
          current_streak: number
          display_name: string | null
          gender: string | null
          height_cm: number | null
          height_inches: number | null
          id: string
          last_workout_date: string | null
          level: number
          longest_streak: number
          preferred_units: string
          total_points: number
          updated_at: string
          weight_updated_at: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          body_weight_kg?: number | null
          body_weight_lbs?: number | null
          created_at?: string
          current_streak?: number
          display_name?: string | null
          gender?: string | null
          height_cm?: number | null
          height_inches?: number | null
          id: string
          last_workout_date?: string | null
          level?: number
          longest_streak?: number
          preferred_units?: string
          total_points?: number
          updated_at?: string
          weight_updated_at?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          body_weight_kg?: number | null
          body_weight_lbs?: number | null
          created_at?: string
          current_streak?: number
          display_name?: string | null
          gender?: string | null
          height_cm?: number | null
          height_inches?: number | null
          id?: string
          last_workout_date?: string | null
          level?: number
          longest_streak?: number
          preferred_units?: string
          total_points?: number
          updated_at?: string
          weight_updated_at?: string | null
        }
        Relationships: []
      }
      story_progress: {
        Row: {
          completed_chapters: Json
          created_at: string
          current_act: number
          current_chapter: number
          faction_choice: string | null
          id: string
          resolution_choice: string | null
          strategy_choice: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_chapters?: Json
          created_at?: string
          current_act?: number
          current_chapter?: number
          faction_choice?: string | null
          id?: string
          resolution_choice?: string | null
          strategy_choice?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_chapters?: Json
          created_at?: string
          current_act?: number
          current_chapter?: number
          faction_choice?: string | null
          id?: string
          resolution_choice?: string | null
          strategy_choice?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_abilities: {
        Row: {
          ability_id: string
          equipped: boolean
          id: string
          last_used: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          ability_id: string
          equipped?: boolean
          id?: string
          last_used?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          ability_id?: string
          equipped?: boolean
          id?: string
          last_used?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_abilities_ability_id_fkey"
            columns: ["ability_id"]
            isOneToOne: false
            referencedRelation: "abilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_abilities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_equipment: {
        Row: {
          equipped: boolean
          id: string
          item_id: string
          purchased_at: string
          rarity: string
          slot: string
          user_id: string
        }
        Insert: {
          equipped?: boolean
          id?: string
          item_id: string
          purchased_at?: string
          rarity: string
          slot: string
          user_id: string
        }
        Update: {
          equipped?: boolean
          id?: string
          item_id?: string
          purchased_at?: string
          rarity?: string
          slot?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_equipment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          rest_seconds: number | null
          sets: number
          target_reps: number
          target_weight: number | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          rest_seconds?: number | null
          sets?: number
          target_reps?: number
          target_weight?: number | null
          workout_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          rest_seconds?: number | null
          sets?: number
          target_reps?: number
          target_weight?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          user_id: string
          workout_date: string
          workout_id: string | null
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id: string
          workout_date?: string
          workout_id?: string | null
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id?: string
          workout_date?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_session_exercises: {
        Row: {
          calories_burned: number | null
          completed: boolean
          created_at: string
          duration_minutes: number | null
          exercise_id: string
          id: string
          order_index: number
          reps: Json
          session_id: string
          sets_completed: number
          user_weight_at_time: number | null
          weights: Json
        }
        Insert: {
          calories_burned?: number | null
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          exercise_id: string
          id?: string
          order_index: number
          reps?: Json
          session_id: string
          sets_completed?: number
          user_weight_at_time?: number | null
          weights?: Json
        }
        Update: {
          calories_burned?: number | null
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          exercise_id?: string
          id?: string
          order_index?: number
          reps?: Json
          session_id?: string
          sets_completed?: number
          user_weight_at_time?: number | null
          weights?: Json
        }
        Relationships: [
          {
            foreignKeyName: "workout_session_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_session_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          started_at: string
          user_id: string
          workout_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          started_at?: string
          user_id: string
          workout_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          started_at?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          category: string
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number
          exercises_count: number
          id: string
          is_custom: boolean
          title: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes: number
          exercises_count: number
          id?: string
          is_custom?: boolean
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number
          exercises_count?: number
          id?: string
          is_custom?: boolean
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_workout_stats: {
        Row: {
          total_calories: number | null
          total_minutes: number | null
          total_workouts: number | null
          unique_days: number | null
          user_id: string | null
          week: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_level_from_xp: {
        Args: { p_xp: number }
        Returns: number
      }
      get_total_workout_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_workout_type_counts: {
        Args: { p_user_id: string }
        Returns: {
          category: string
          count: number
        }[]
      }
      increment_character_stats: {
        Args: {
          p_agility?: number
          p_endurance?: number
          p_focus?: number
          p_resourcefulness?: number
          p_strength?: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_user_streak: {
        Args: { p_user_id: string; p_workout_date: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
