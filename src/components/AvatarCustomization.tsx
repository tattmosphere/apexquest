import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAvatar } from "@/hooks/useAvatar";
import { useAuth } from "@/hooks/useAuth";
import type { SkinTone, Gender } from "@/utils/avatarAssets";

interface AvatarCustomizationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGender: Gender;
  currentSkinTone: SkinTone;
  classType: string;
  level: number;
  onSave: () => void;
}

export const AvatarCustomization = ({
  open,
  onOpenChange,
  currentGender,
  currentSkinTone,
  classType,
  level,
  onSave
}: AvatarCustomizationProps) => {
  const { user } = useAuth();
  const [gender, setGender] = useState<Gender>(currentGender);
  const [skinTone, setSkinTone] = useState<SkinTone>(currentSkinTone);
  const [saving, setSaving] = useState(false);

  const previewAvatar = useAvatar(
    user?.id || '',
    classType,
    [],
    level,
    skinTone,
    gender,
    true
  );

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('characters')
        .update({
          avatar_gender: gender,
          avatar_skin_tone: skinTone
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Avatar customization saved!');
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving avatar customization:', error);
      toast.error('Failed to save avatar customization');
    } finally {
      setSaving(false);
    }
  };

  const skinToneOptions: { value: SkinTone; label: string; color: string }[] = [
    { value: 'verylight', label: 'Very Light', color: '#FFE0BD' },
    { value: 'light', label: 'Light', color: '#F1C27D' },
    { value: 'medium', label: 'Medium', color: '#C68642' },
    { value: 'tan', label: 'Tan', color: '#8D5524' },
    { value: 'dark', label: 'Dark', color: '#6B4423' },
    { value: 'verydark', label: 'Very Dark', color: '#4A2511' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Avatar</DialogTitle>
          <DialogDescription>
            Choose how your character appears in the game
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-full border-4 border-primary overflow-hidden bg-background">
              <img 
                src={previewAvatar} 
                alt="Avatar Preview" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div className="space-y-3">
            <Label>Gender Presentation</Label>
            <RadioGroup value={gender} onValueChange={(value) => setGender(value as Gender)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="cursor-pointer">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="neutral" />
                <Label htmlFor="neutral" className="cursor-pointer">Non-binary / Neutral</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Skin Tone Selection */}
          <div className="space-y-3">
            <Label>Skin Tone</Label>
            <RadioGroup value={skinTone} onValueChange={(value) => setSkinTone(value as SkinTone)}>
              {skinToneOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-border"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

