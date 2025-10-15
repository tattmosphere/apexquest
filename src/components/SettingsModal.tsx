import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useHealthSync } from "@/hooks/useHealthSync";
import { getPlatformName } from "@/utils/platform";
import { Activity, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { 
    isAvailable, 
    isEnabled, 
    lastSyncAt, 
    permissions, 
    isSyncing,
    enableSync, 
    disableSync, 
    performSync 
  } = useHealthSync();
  
  // Type assertions for profile fields that exist in database but not yet in types
  const profileData = profile as any;
  
  const [preferredUnits, setPreferredUnits] = useState(profileData?.preferred_units || "lbs");
  const [bodyWeightLbs, setBodyWeightLbs] = useState(profileData?.body_weight_lbs || "");
  const [bodyWeightKg, setBodyWeightKg] = useState(profileData?.body_weight_kg || "");
  const [age, setAge] = useState(profileData?.age || "");
  const [heightCm, setHeightCm] = useState(profileData?.height_cm || "");
  const [heightInches, setHeightInches] = useState(profileData?.height_inches || "");
  const [gender, setGender] = useState(profileData?.gender || "");
  const [activityLevel, setActivityLevel] = useState(profileData?.activity_level || "moderately_active");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileData) {
      setPreferredUnits(profileData.preferred_units || "lbs");
      setBodyWeightLbs(profileData.body_weight_lbs || "");
      setBodyWeightKg(profileData.body_weight_kg || "");
      setAge(profileData.age || "");
      setHeightCm(profileData.height_cm || "");
      setHeightInches(profileData.height_inches || "");
      setGender(profileData.gender || "");
      setActivityLevel(profileData.activity_level || "moderately_active");
    }
  }, [profileData]);

  // Auto-convert weight between units
  const handleWeightChange = (value: string, unit: 'lbs' | 'kg') => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (unit === 'lbs') {
        setBodyWeightLbs(value);
        setBodyWeightKg((numValue / 2.20462).toFixed(1));
      } else {
        setBodyWeightKg(value);
        setBodyWeightLbs((numValue * 2.20462).toFixed(1));
      }
    } else {
      if (unit === 'lbs') {
        setBodyWeightLbs(value);
        setBodyWeightKg("");
      } else {
        setBodyWeightKg(value);
        setBodyWeightLbs("");
      }
    }
  };

  // Auto-convert height between units
  const handleHeightChange = (value: string, unit: 'cm' | 'inches') => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (unit === 'cm') {
        setHeightCm(value);
        setHeightInches((numValue / 2.54).toFixed(1));
      } else {
        setHeightInches(value);
        setHeightCm((numValue * 2.54).toFixed(1));
      }
    } else {
      if (unit === 'cm') {
        setHeightCm(value);
        setHeightInches("");
      } else {
        setHeightInches(value);
        setHeightCm("");
      }
    }
  };

  // Calculate BMR using Mifflin-St Jeor equation
  const calculateBMR = () => {
    const weight = parseFloat(bodyWeightKg);
    const height = parseFloat(heightCm);
    const ageNum = parseInt(age);

    if (!weight || !height || !ageNum || !gender) return null;

    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * ageNum + 5;
    } else if (gender === 'female') {
      return 10 * weight + 6.25 * height - 5 * ageNum - 161;
    }
    return null;
  };

  // Calculate TDEE
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    if (!bmr) return null;

    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };

    return bmr * multipliers[activityLevel as keyof typeof multipliers];
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updates: any = {
        preferred_units: preferredUnits,
        age: age ? parseInt(age) : null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        height_inches: heightInches ? parseFloat(heightInches) : null,
        gender: gender || null,
        activity_level: activityLevel,
      };

      // Only update weight if changed
      if (bodyWeightLbs) {
        updates.body_weight_lbs = parseFloat(bodyWeightLbs);
        updates.body_weight_kg = parseFloat(bodyWeightKg);
        updates.weight_updated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Settings saved!");
      onClose();
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const bmr = calculateBMR();
  const tdee = calculateTDEE();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="units" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="body">Body Stats</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="health">Health Sync</TabsTrigger>
          </TabsList>

          <TabsContent value="units" className="space-y-4">
            <div>
              <Label className="text-base">Preferred Weight Units</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose how weight should be displayed during workouts
              </p>
              <RadioGroup value={preferredUnits} onValueChange={setPreferredUnits}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lbs" id="lbs" />
                  <Label htmlFor="lbs" className="font-normal cursor-pointer">
                    Pounds (lbs)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kg" id="kg" />
                  <Label htmlFor="kg" className="font-normal cursor-pointer">
                    Kilograms (kg)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="body" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight-lbs">Body Weight (lbs)</Label>
                <Input
                  id="weight-lbs"
                  type="number"
                  value={bodyWeightLbs}
                  onChange={(e) => handleWeightChange(e.target.value, 'lbs')}
                  placeholder="150"
                />
              </div>
              <div>
                <Label htmlFor="weight-kg">Body Weight (kg)</Label>
                <Input
                  id="weight-kg"
                  type="number"
                  value={bodyWeightKg}
                  onChange={(e) => handleWeightChange(e.target.value, 'kg')}
                  placeholder="68"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height-cm">Height (cm)</Label>
                <Input
                  id="height-cm"
                  type="number"
                  value={heightCm}
                  onChange={(e) => handleHeightChange(e.target.value, 'cm')}
                  placeholder="170"
                />
              </div>
              <div>
                <Label htmlFor="height-inches">Height (inches)</Label>
                <Input
                  id="height-inches"
                  type="number"
                  value={heightInches}
                  onChange={(e) => handleHeightChange(e.target.value, 'inches')}
                  placeholder="67"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bmr && tdee && (
              <div className="bg-accent/50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Your Calorie Needs</h4>
                <div className="text-sm">
                  <p>BMR (Basal Metabolic Rate): <span className="font-bold">{Math.round(bmr)} cal/day</span></p>
                  <p>TDEE (Total Daily Energy Expenditure): <span className="font-bold">{Math.round(tdee)} cal/day</span></p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on the Mifflin-St Jeor equation
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div>
              <Label htmlFor="activity-level">Activity Level</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Used to calculate your daily calorie needs
              </p>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                  <SelectItem value="extra_active">Extra Active (athlete/physical job)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div>
              <Label className="text-base">Dashboard Layout</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Customize the order of sections on your dashboard. Hover over sections on the main page to drag and reorder them.
              </p>
              <div className="p-4 bg-accent/50 rounded-lg">
                <p className="text-sm">
                  ℹ️ To reorder sections, close this settings dialog and hover over any section on your dashboard. 
                  A grip handle will appear that you can drag to move the section up or down.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            {!isAvailable ? (
              <div className="p-4 bg-muted rounded-lg text-center">
                <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h4 className="font-semibold mb-2">Health Sync Unavailable</h4>
                <p className="text-sm text-muted-foreground">
                  Health sync is only available on iOS and Android native apps.
                  Export your project to GitHub and build native apps to enable this feature.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Enable {getPlatformName()} Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync workouts and body weight with {getPlatformName()}
                    </p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        enableSync();
                      } else {
                        disableSync();
                      }
                    }}
                  />
                </div>

                {isEnabled && (
                  <>
                    <div className="p-4 bg-accent/50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sync Status</span>
                        <Badge variant={isSyncing ? "secondary" : "outline"}>
                          {isSyncing ? "Syncing..." : "Active"}
                        </Badge>
                      </div>
                      
                      {lastSyncAt && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })}
                        </p>
                      )}

                      <Button
                        onClick={performSync}
                        disabled={isSyncing}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? "Syncing..." : "Sync Now"}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Permissions Granted</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Badge variant={permissions.workouts ? "default" : "outline"}>
                          {permissions.workouts ? "✓" : "×"} Workouts
                        </Badge>
                        <Badge variant={permissions.bodyWeight ? "default" : "outline"}>
                          {permissions.bodyWeight ? "✓" : "×"} Body Weight
                        </Badge>
                        <Badge variant={permissions.steps ? "default" : "outline"}>
                          {permissions.steps ? "✓" : "×"} Steps
                        </Badge>
                        <Badge variant={permissions.activeCalories ? "default" : "outline"}>
                          {permissions.activeCalories ? "✓" : "×"} Calories
                        </Badge>
                      </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        💡 Tip: Workouts you complete in ApexQuest will automatically sync to {getPlatformName()}, 
                        and workouts from {getPlatformName()} will be imported to earn XP and level up your character!
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button onClick={saveSettings} disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
