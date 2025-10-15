import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, BookOpen, Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCharacter } from "@/hooks/useCharacter";
import { toast } from "sonner";
import storyContent from "@/data/storyContent.json";

interface StoryModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StoryModeDialog = ({ open, onOpenChange }: StoryModeDialogProps) => {
  const { user } = useAuth();
  const { character, level } = useCharacter();
  const [storyProgress, setStoryProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadStoryProgress();
    }
  }, [open, user]);

  const loadStoryProgress = async () => {
    const { data, error } = await supabase
      .from('story_progress')
      .select('*')
      .eq('user_id', user!.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading story progress:', error);
    }

    if (!data) {
      // Create initial progress
      const { data: newProgress } = await supabase
        .from('story_progress')
        .insert({
          user_id: user!.id,
          current_act: 1,
          current_chapter: 1,
          completed_chapters: []
        })
        .select()
        .single();
      
      setStoryProgress(newProgress);
    } else {
      setStoryProgress(data);
    }
    setLoading(false);
  };

  const completeChapter = async (chapterId: number) => {
    if (!storyProgress) return;

    const completedChapters = [...(storyProgress.completed_chapters || []), chapterId];

    const { error } = await supabase
      .from('story_progress')
      .update({
        current_chapter: chapterId + 1,
        completed_chapters: completedChapters
      })
      .eq('user_id', user!.id);

    if (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to save progress');
      return;
    }

    toast.success('Chapter completed! 📖');
    loadStoryProgress();
  };

  const makeChoice = async (choiceType: string, choiceValue: string) => {
    const updateData: any = {};
    updateData[choiceType] = choiceValue;

    const { error } = await supabase
      .from('story_progress')
      .update(updateData)
      .eq('user_id', user!.id);

    if (error) {
      console.error('Error saving choice:', error);
      toast.error('Failed to save choice');
      return;
    }

    toast.success('Choice recorded! 🎯');
    loadStoryProgress();
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="py-8 text-center">Loading story...</div>
        </DialogContent>
      </Dialog>
    );
  }

  const act1 = storyContent.act1;
  const currentChapter = storyProgress?.current_chapter || 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Story Mode - {act1.title}
          </DialogTitle>
          <DialogDescription>
            {act1.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {act1.chapters.map((chapter: any) => {
            const isUnlocked = level >= chapter.unlock_level;
            const isCompleted = storyProgress?.completed_chapters?.includes(chapter.id) || false;
            const isCurrent = chapter.id === currentChapter;

            return (
              <Card 
                key={chapter.id} 
                className={`p-6 ${!isUnlocked ? 'opacity-50' : ''} ${isCurrent ? 'border-primary' : ''}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        Chapter {chapter.id}: {chapter.title}
                        {isCompleted && <Badge variant="secondary">Completed</Badge>}
                        {isCurrent && !isCompleted && <Badge>Current</Badge>}
                      </h3>
                      {!isUnlocked && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Lock className="h-3 w-3" />
                          Unlocks at Level {chapter.unlock_level}
                        </p>
                      )}
                    </div>
                  </div>

                  {isUnlocked && (
                    <>
                      <p className="text-sm leading-relaxed">
                        {chapter.content}
                      </p>

                      {chapter.choice && !isCompleted && (
                        <div className="space-y-2 pt-2">
                          <p className="text-sm font-medium">Make your choice:</p>
                          <div className="space-y-2">
                            {chapter.choice.options.map((option: any) => (
                              <Button
                                key={option.id}
                                variant="outline"
                                className="w-full justify-start text-left h-auto py-3"
                                onClick={() => makeChoice(chapter.choice.type + '_choice', option.id)}
                                disabled={storyProgress?.[chapter.choice.type + '_choice'] === option.id}
                              >
                                <div>
                                  <div className="font-semibold">{option.label}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {option.description}
                                  </div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {!isCompleted && !chapter.choice && (
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Coins className="h-4 w-4" />
                            <span>Reward: {chapter.xp_reward} XP • {chapter.credits_reward} SC</span>
                          </div>
                          <Button onClick={() => completeChapter(chapter.id)}>
                            Complete Chapter
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};