import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Swords, Target } from "lucide-react";
import { useState } from "react";
import { getChapter } from "@/data/storyChapters";

interface StoryProgressCardProps {
  currentChapter: number;
  chapterProgress: number; // 0-100
  onViewStory: () => void;
}



export const StoryProgressCard = ({ 
  currentChapter, 
  chapterProgress,
  onViewStory 
}: StoryProgressCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const chapter = getChapter(currentChapter);
  const nextChapter = getChapter(currentChapter + 1);
  
  if (!chapter) return null;
  
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/90 border-2 border-primary/20 shadow-lg">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1 text-xs">
                {chapter.act}
              </Badge>
              <h3 className="font-bold text-lg text-card-foreground">
                Chapter {chapter.id}: {chapter.title}
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-muted-foreground hover:text-card-foreground"
          >
            {showDetails ? "Hide" : "Details"}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Chapter Progress</span>
            <span className="font-semibold text-card-foreground">{Math.floor(chapterProgress)}%</span>
          </div>
          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${chapterProgress}%` }}
            />
          </div>
        </div>

        {/* Details Section (collapsible) */}
        {showDetails && (
          <div className="space-y-3 pt-2 border-t border-border/50 animate-fade-in">
            <p className="text-sm text-muted-foreground italic">
              "{chapter.preview}"
            </p>
            
            {chapter.boss && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <Swords className="h-4 w-4 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Boss Challenge</p>
                  <p className="font-semibold text-sm text-destructive">{chapter.boss}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Requirement */}
        {nextChapter && chapterProgress >= 100 && (
          <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <Target className="h-4 w-4 text-accent" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Next Chapter</p>
              <p className="font-semibold text-sm text-card-foreground">
                {nextChapter.requirement}
              </p>
            </div>
          </div>
        )}

        {chapterProgress < 100 && (
          <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <Target className="h-4 w-4 text-accent" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">To Complete</p>
              <p className="font-semibold text-sm text-card-foreground">
                {chapter.requirement}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={onViewStory}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={chapterProgress < 100}
        >
          {chapterProgress >= 100 ? (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              View Story
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Complete Workouts to Continue
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

