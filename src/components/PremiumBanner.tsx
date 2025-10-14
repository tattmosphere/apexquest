import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const PremiumBanner = () => {
  return (
    <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Unlock Premium Workout Plans</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get personalized workout routines created by AI, tailored to your fitness goals and experience level.
          </p>
          <Button variant="default">
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </Card>
  );
};
