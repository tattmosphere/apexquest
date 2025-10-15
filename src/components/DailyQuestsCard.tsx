import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Check } from "lucide-react";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { Skeleton } from "@/components/ui/skeleton";

export const DailyQuestsCard = () => {
  const { quests, loading, getQuestLabel } = useDailyQuests();

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  if (quests.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Daily Quests
        </h3>
        <p className="text-sm text-muted-foreground">
          No quests available. Check back tomorrow!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Target className="h-5 w-5" />
        Daily Quests
      </h3>
      <div className="space-y-3">
        {quests.map((quest) => (
          <div key={quest.id} className="space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium">
                {getQuestLabel(quest.quest_type)}
              </span>
              {quest.completed && (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </div>
            <Progress
              value={(quest.current_progress / quest.target_value) * 100}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {quest.current_progress}/{quest.target_value}
              </span>
              <span>
                +{quest.xp_reward} XP • +{quest.credits_reward} SC
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
