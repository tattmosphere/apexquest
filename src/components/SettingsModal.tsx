import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [preferredUnits, setPreferredUnits] = useState((profile as any)?.preferred_units || "lbs");
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ preferred_units: preferredUnits })
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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

          <div className="flex gap-2">
            <Button onClick={saveSettings} disabled={saving} className="flex-1">
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
