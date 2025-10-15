import { supabase } from "@/integrations/supabase/client";
import { isNativeiOS, isNativeAndroid } from "@/utils/platform";
import { toast } from "sonner";

// Note: This file provides a framework for health sync.
// The actual @capacitor-community/health plugin needs to be installed manually after exporting to GitHub.
// For now, this provides the structure and web-safe fallbacks.

export interface HealthPermissions {
  workouts: boolean;
  bodyWeight: boolean;
  steps: boolean;
  activeCalories: boolean;
  heartRate: boolean;
}

export interface HealthWorkout {
  externalId: string;
  type: string;
  startDate: Date;
  endDate: Date;
  duration: number; // minutes
  calories?: number;
  distance?: number;
}

class HealthSyncService {
  private healthKitAvailable = false;

  async initialize(): Promise<boolean> {
    if (!isNativeiOS() && !isNativeAndroid()) {
      return false;
    }

    try {
      // TODO: After exporting to GitHub, install @capacitor-community/health
      // const { Health } = await import('@capacitor-community/health');
      // await Health.isAvailable();
      this.healthKitAvailable = true;
      return true;
    } catch (error) {
      console.error('Health plugin not available:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<HealthPermissions> {
    if (!this.healthKitAvailable) {
      toast.error("Health sync is only available on iOS and Android apps");
      return this.getEmptyPermissions();
    }

    try {
      // TODO: After installing @capacitor-community/health plugin:
      // const { Health } = await import('@capacitor-community/health');
      // await Health.requestAuthorization({
      //   read: ['activity', 'workout', 'body.weight', 'steps', 'calories.active', 'heart_rate'],
      //   write: ['activity', 'workout']
      // });

      const permissions: HealthPermissions = {
        workouts: true,
        bodyWeight: true,
        steps: true,
        activeCalories: true,
        heartRate: true,
      };

      // Save permissions to profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ health_permissions_granted: permissions as any })
          .eq('id', user.id);
      }

      return permissions;
    } catch (error) {
      console.error('Error requesting health permissions:', error);
      toast.error("Failed to request health permissions");
      return this.getEmptyPermissions();
    }
  }

  async importWorkouts(startDate: Date, endDate: Date): Promise<number> {
    if (!this.healthKitAvailable) {
      return 0;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // TODO: After installing health plugin:
      // const { Health } = await import('@capacitor-community/health');
      // const workouts = await Health.queryWorkouts({
      //   startDate: startDate.toISOString(),
      //   endDate: endDate.toISOString()
      // });

      // Mock data for development
      const workouts: HealthWorkout[] = [];
      
      let importedCount = 0;

      for (const workout of workouts) {
        // Check if already imported
        const { data: existing } = await supabase
          .from('workout_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('health_kit_id', workout.externalId)
          .single();

        if (existing) continue; // Skip duplicates

        // Create workout session
        const { data: session, error } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: user.id,
            workout_id: null, // Imported workouts don't have a template
            health_kit_id: workout.externalId,
            synced_to_health: true,
            health_sync_status: 'synced',
            started_at: workout.startDate.toISOString(),
            completed_at: workout.endDate.toISOString(),
          })
          .select()
          .single();

        if (error || !session) continue;

        // Log sync
        await supabase.from('health_sync_log').insert({
          user_id: user.id,
          sync_type: 'import',
          data_type: 'workout',
          platform: isNativeiOS() ? 'ios' : 'android',
          external_id: workout.externalId,
          status: 'success',
          metadata: { calories: workout.calories, duration: workout.duration }
        });

        importedCount++;
      }

      // Update last sync time
      await supabase
        .from('profiles')
        .update({ last_health_sync_at: new Date().toISOString() })
        .eq('id', user.id);

      return importedCount;
    } catch (error) {
      console.error('Error importing workouts:', error);
      toast.error("Failed to import workouts from Health");
      return 0;
    }
  }

  async exportWorkout(sessionId: string): Promise<boolean> {
    if (!this.healthKitAvailable) {
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get session details
      const { data: session } = await supabase
        .from('workout_sessions')
        .select('*, workout:workouts(*)')
        .eq('id', sessionId)
        .single();

      if (!session || !session.started_at || !session.completed_at) {
        return false;
      }

      // TODO: After installing health plugin:
      // const { Health } = await import('@capacitor-community/health');
      // const result = await Health.writeWorkout({
      //   activityType: this.mapWorkoutType(session.workout?.category),
      //   start: session.started_at,
      //   end: session.completed_at,
      //   totalEnergyBurned: session.calories_burned,
      //   totalDistance: session.distance
      // });

      // Update session with health sync status
      await supabase
        .from('workout_sessions')
        .update({
          synced_to_health: true,
          health_sync_status: 'synced',
          // health_kit_id: result.id // from actual export
        })
        .eq('id', sessionId);

      // Log sync
      await supabase.from('health_sync_log').insert({
        user_id: user.id,
        sync_type: 'export',
        data_type: 'workout',
        platform: isNativeiOS() ? 'ios' : 'android',
        external_id: sessionId,
        status: 'success'
      });

      return true;
    } catch (error) {
      console.error('Error exporting workout:', error);
      
      // Update as failed
      await supabase
        .from('workout_sessions')
        .update({ health_sync_status: 'failed' })
        .eq('id', sessionId);

      return false;
    }
  }

  async syncBodyWeight(weightLbs: number): Promise<boolean> {
    if (!this.healthKitAvailable) return false;

    try {
      // TODO: After installing health plugin:
      // const { Health } = await import('@capacitor-community/health');
      // await Health.writeData({
      //   type: 'body.weight',
      //   value: weightLbs,
      //   unit: 'lb',
      //   date: new Date().toISOString()
      // });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('health_sync_log').insert({
          user_id: user.id,
          sync_type: 'export',
          data_type: 'body_weight',
          platform: isNativeiOS() ? 'ios' : 'android',
          status: 'success',
          metadata: { weight_lbs: weightLbs }
        });
      }

      return true;
    } catch (error) {
      console.error('Error syncing body weight:', error);
      return false;
    }
  }

  private mapWorkoutType(category?: string): string {
    const mapping: Record<string, string> = {
      'strength': 'traditionalStrengthTraining',
      'cardio': 'running',
      'hiit': 'highIntensityIntervalTraining',
      'yoga': 'yoga',
      'crossfit': 'crossTraining'
    };
    return mapping[category?.toLowerCase() || ''] || 'other';
  }

  private getEmptyPermissions(): HealthPermissions {
    return {
      workouts: false,
      bodyWeight: false,
      steps: false,
      activeCalories: false,
      heartRate: false,
    };
  }

  async getPermissionStatus(): Promise<HealthPermissions> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return this.getEmptyPermissions();

    const { data: profile } = await supabase
      .from('profiles')
      .select('health_permissions_granted')
      .eq('id', user.id)
      .single();

    if (profile?.health_permissions_granted && typeof profile.health_permissions_granted === 'object') {
      return profile.health_permissions_granted as unknown as HealthPermissions;
    }
    return this.getEmptyPermissions();
  }
}

export const healthSync = new HealthSyncService();
