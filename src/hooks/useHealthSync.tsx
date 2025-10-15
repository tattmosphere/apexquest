import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { healthSync, HealthPermissions } from "@/services/healthSync";
import { supportsHealthSync } from "@/utils/platform";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useHealthSync = () => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<HealthPermissions>({
    workouts: false,
    bodyWeight: false,
    steps: false,
    activeCalories: false,
    heartRate: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAvailable] = useState(supportsHealthSync());

  useEffect(() => {
    if (!user || !isAvailable) return;

    const loadSyncStatus = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("health_sync_enabled, last_health_sync_at, health_permissions_granted")
        .eq("id", user.id)
        .single();

      if (profile) {
        setIsEnabled(profile.health_sync_enabled);
        setLastSyncAt(profile.last_health_sync_at);
        if (profile.health_permissions_granted && typeof profile.health_permissions_granted === 'object') {
          setPermissions(profile.health_permissions_granted as unknown as HealthPermissions);
        }
      }
    };

    loadSyncStatus();
  }, [user, isAvailable]);

  const enableSync = async () => {
    if (!user) return;

    try {
      await healthSync.initialize();
      const granted = await healthSync.requestPermissions();
      setPermissions(granted);

      await supabase
        .from("profiles")
        .update({ health_sync_enabled: true })
        .eq("id", user.id);

      setIsEnabled(true);
      toast.success("Health sync enabled successfully");
      
      // Perform initial sync
      await performSync();
    } catch (error) {
      console.error("Error enabling health sync:", error);
      toast.error("Failed to enable health sync");
    }
  };

  const disableSync = async () => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ health_sync_enabled: false })
        .eq("id", user.id);

      setIsEnabled(false);
      toast.success("Health sync disabled");
    } catch (error) {
      console.error("Error disabling health sync:", error);
      toast.error("Failed to disable health sync");
    }
  };

  const performSync = async () => {
    if (!user || !isEnabled) return;

    setIsSyncing(true);
    try {
      // Import workouts from last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const importedCount = await healthSync.importWorkouts(startDate, endDate);
      
      if (importedCount > 0) {
        toast.success(`Imported ${importedCount} workout${importedCount > 1 ? 's' : ''} from Health`);
      }

      // Update last sync time
      const now = new Date().toISOString();
      await supabase
        .from("profiles")
        .update({ last_health_sync_at: now })
        .eq("id", user.id);

      setLastSyncAt(now);
    } catch (error) {
      console.error("Error syncing health data:", error);
      toast.error("Failed to sync health data");
    } finally {
      setIsSyncing(false);
    }
  };

  const exportWorkout = async (sessionId: string) => {
    if (!isEnabled) return false;

    try {
      const success = await healthSync.exportWorkout(sessionId);
      if (success) {
        toast.success("Workout synced to Health");
      }
      return success;
    } catch (error) {
      console.error("Error exporting workout:", error);
      return false;
    }
  };

  return {
    isAvailable,
    isEnabled,
    lastSyncAt,
    permissions,
    isSyncing,
    enableSync,
    disableSync,
    performSync,
    exportWorkout,
  };
};
