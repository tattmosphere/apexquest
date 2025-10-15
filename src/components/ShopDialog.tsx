import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCharacter } from "@/hooks/useCharacter";
import { toast } from "sonner";
import equipmentItems from "@/data/equipmentItems.json";

interface ShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShopDialog = ({ open, onOpenChange }: ShopDialogProps) => {
  const { user } = useAuth();
  const { character } = useCharacter();
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('all');

  useEffect(() => {
    if (open && user) {
      loadOwnedItems();
    }
  }, [open, user]);

  const loadOwnedItems = async () => {
    const { data } = await supabase
      .from('user_equipment')
      .select('item_id')
      .eq('user_id', user!.id);

    setOwnedItems(data?.map(item => item.item_id) || []);
  };

  const purchaseItem = async (item: any) => {
    if (!character || character.survival_credits < item.cost) {
      toast.error('Not enough Survival Credits!');
      return;
    }

    // Deduct credits
    const { error: updateError } = await supabase
      .from('characters')
      .update({ survival_credits: character.survival_credits - item.cost })
      .eq('user_id', user!.id);

    if (updateError) {
      toast.error('Purchase failed');
      return;
    }

    // Add to inventory
    const { error: insertError } = await supabase
      .from('user_equipment')
      .insert({
        user_id: user!.id,
        item_id: item.id,
        slot: item.slot,
        rarity: item.rarity,
        equipped: false
      });

    if (insertError) {
      toast.error('Failed to add item');
      return;
    }

    toast.success(`Purchased ${item.name}! 🛍️`);
    loadOwnedItems();
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'bg-gray-500',
      uncommon: 'bg-green-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-orange-500',
    };
    return colors[rarity] || 'bg-gray-500';
  };

  const filteredItems = selectedSlot === 'all' 
    ? equipmentItems.items 
    : equipmentItems.items.filter(item => item.slot === selectedSlot);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Equipment Shop
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span>Your Credits: {character?.survival_credits || 0} SC</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedSlot} onValueChange={setSelectedSlot}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="weapon_primary">Weapons</TabsTrigger>
            <TabsTrigger value="helmet">Helmets</TabsTrigger>
            <TabsTrigger value="chest">Armor</TabsTrigger>
            <TabsTrigger value="accessory">Accessories</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedSlot} className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {filteredItems.map((item: any) => {
                const owned = ownedItems.includes(item.id);
                const canAfford = (character?.survival_credits || 0) >= item.cost;

                return (
                  <Card key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <Badge className={`${getRarityColor(item.rarity)} text-white text-xs mt-1`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      {owned && (
                        <Badge variant="secondary">Owned</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                        <span className={!canAfford ? 'text-destructive' : ''}>{item.cost} SC</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => purchaseItem(item)}
                        disabled={owned || !canAfford}
                      >
                        {owned ? 'Owned' : 'Purchase'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};