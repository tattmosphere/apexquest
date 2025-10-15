import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbilities } from "@/hooks/useAbilities";
import { useCharacter } from "@/hooks/useCharacter";
import { Lock, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import * as Icons from "lucide-react";

interface AbilityTreeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AbilityTreeDialog = ({ open, onOpenChange }: AbilityTreeDialogProps) => {
  const { abilities, unlockedAbilities, loading, toggleEquipAbility } = useAbilities();
  const { character, level } = useCharacter();

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Zap;
    return IconComponent;
  };

  const isUnlocked = (abilityId: string) => {
    return unlockedAbilities.some((ua) => ua.ability_id === abilityId);
  };

  const isEquipped = (abilityId: string) => {
    return unlockedAbilities.some((ua) => ua.ability_id === abilityId && ua.equipped);
  };

  const getAbilityProgress = (ability: any) => {
    // This would need actual workout counts - simplified for now
    return Math.min((level / ability.unlock_level) * 100, 100);
  };

  const renderAbilities = (classType: string) => {
    const classAbilities = abilities.filter((a) => a.class_type === classType);
    
    if (classAbilities.length === 0) {
      return <p className="text-sm text-muted-foreground">No abilities available</p>;
    }

    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((tier) => {
          const tierAbilities = classAbilities.filter((a) => a.tier === tier);
          if (tierAbilities.length === 0) return null;

          return (
            <div key={tier}>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                Tier {tier}
              </h4>
              <div className="grid gap-3">
                {tierAbilities.map((ability) => {
                  const unlocked = isUnlocked(ability.id);
                  const equipped = isEquipped(ability.id);
                  const Icon = getIcon(ability.icon_name);

                  return (
                    <Card
                      key={ability.id}
                      className={`p-4 ${unlocked ? "" : "opacity-50"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${unlocked ? "bg-primary/10" : "bg-muted"}`}>
                          <Icon className={`h-5 w-5 ${unlocked ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-semibold">{ability.name}</h5>
                              <p className="text-xs text-muted-foreground">
                                {ability.description}
                              </p>
                            </div>
                            <Badge variant={ability.ability_type === "ultimate" ? "default" : "secondary"}>
                              {ability.ability_type}
                            </Badge>
                          </div>

                          {!unlocked && (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Unlock: {ability.unlock_workout_count} workouts, Level {ability.unlock_level}
                              </p>
                              <Progress value={getAbilityProgress(ability)} className="h-1" />
                            </div>
                          )}

                          {unlocked && ability.ability_type !== "passive" && (
                            <Button
                              size="sm"
                              variant={equipped ? "default" : "outline"}
                              onClick={() => toggleEquipAbility(ability.id)}
                            >
                              {equipped ? <Check className="h-4 w-4 mr-1" /> : null}
                              {equipped ? "Equipped" : "Equip"}
                            </Button>
                          )}

                          {unlocked && ability.ability_type === "passive" && (
                            <Badge variant="outline" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Auto-equipped
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading || !character) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ability Tree</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ability Tree</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Unlock abilities by completing workouts and leveling up
          </p>
        </DialogHeader>

        <Tabs defaultValue={character.class_type}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={character.class_type}>
              Primary Class
            </TabsTrigger>
            {character.secondary_class && (
              <TabsTrigger value={character.secondary_class}>
                Secondary Class
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value={character.class_type} className="mt-4">
            {renderAbilities(character.class_type)}
          </TabsContent>

          {character.secondary_class && (
            <TabsContent value={character.secondary_class} className="mt-4">
              {renderAbilities(character.secondary_class)}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
