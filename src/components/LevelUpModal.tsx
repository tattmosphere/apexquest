import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface LevelUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLevel: number;
}

export const LevelUpModal = ({ open, onOpenChange, newLevel }: LevelUpModalProps) => {
  const [displayLevel, setDisplayLevel] = useState(newLevel - 1);

  useEffect(() => {
    if (open) {
      // Animate level counting up
      const timer = setTimeout(() => {
        setDisplayLevel(newLevel);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, newLevel]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/50">
        <div className="text-center space-y-6 py-8">
          <Sparkles className="h-20 w-20 mx-auto text-primary animate-pulse" />
          
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-primary tracking-wider animate-in fade-in slide-in-from-bottom-4">
              LEVEL UP!
            </h2>
            <p className="text-7xl font-black tabular-nums animate-in fade-in slide-in-from-bottom-4 delay-150">
              {displayLevel}
            </p>
          </div>

          <div className="space-y-2 text-muted-foreground animate-in fade-in slide-in-from-bottom-4 delay-300">
            <p className="text-lg">You've grown stronger!</p>
            <p className="text-sm">New abilities may be unlocked</p>
          </div>

          <Button 
            onClick={() => onOpenChange(false)} 
            size="lg" 
            className="w-full animate-in fade-in slide-in-from-bottom-4 delay-500"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};