import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Trophy, Coins, Zap, Sword } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface StoryCard {
  type: "story" | "rewards";
  image?: string;
  title?: string;
  text: string;
  rewards?: {
    xp: number;
    credits: number;
    abilities?: string[];
    equipment?: string[];
    achievements?: string[];
  };
}

interface StoryCardViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterNumber: number;
  chapterTitle: string;
  cards: StoryCard[];
}

export const StoryCardViewer = ({
  open,
  onOpenChange,
  chapterNumber,
  chapterTitle,
  cards
}: StoryCardViewerProps) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentCard < cards.length - 1) {
      setDirection(1);
      setCurrentCard(currentCard + 1);
    } else {
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setDirection(-1);
      setCurrentCard(currentCard - 1);
    }
  };

  const handleClose = () => {
    setCurrentCard(0);
    onOpenChange(false);
  };

  const card = cards[currentCard];
  const isLastCard = currentCard === cards.length - 1;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden bg-background border-2 border-primary/30">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-1">
                Chapter {chapterNumber}
              </Badge>
              <h2 className="text-xl font-bold text-white">{chapterTitle}</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Card Content */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentCard}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full h-full"
            >
              {card.type === "story" ? (
                // Story Card
                <div className="relative w-full h-full">
                  {/* Background Image */}
                  <img
                    src={card.image}
                    alt={card.title || "Story scene"}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  
                  {/* Text Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                    {card.title && (
                      <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                        {card.title}
                      </h3>
                    )}
                    <p className="text-lg text-white/95 leading-relaxed drop-shadow-md max-w-3xl">
                      {card.text}
                    </p>
                  </div>
                </div>
              ) : (
                // Rewards Card
                <div className="w-full h-full bg-gradient-to-br from-accent/20 via-background to-primary/20 flex items-center justify-center p-8">
                  <div className="max-w-2xl w-full space-y-8 text-center">
                    <div>
                      <Trophy className="h-16 w-16 text-accent mx-auto mb-4" />
                      <h3 className="text-3xl font-bold text-foreground mb-2">
                        Chapter Complete!
                      </h3>
                      <p className="text-muted-foreground">
                        {card.text}
                      </p>
                    </div>

                    {/* Rewards Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* XP */}
                      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
                        <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">Experience</p>
                        <p className="text-2xl font-bold text-foreground">
                          +{card.rewards?.xp} XP
                        </p>
                      </div>

                      {/* Credits */}
                      <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-accent/20">
                        <Coins className="h-8 w-8 text-accent mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">Credits</p>
                        <p className="text-2xl font-bold text-foreground">
                          +{card.rewards?.credits} SC
                        </p>
                      </div>
                    </div>

                    {/* Unlocked Items */}
                    {(card.rewards?.abilities || card.rewards?.equipment || card.rewards?.achievements) && (
                      <div className="space-y-4">
                        <h4 className="text-xl font-semibold text-foreground">Unlocked</h4>
                        
                        {card.rewards?.abilities && card.rewards.abilities.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">New Abilities</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {card.rewards.abilities.map((ability, i) => (
                                <Badge key={i} className="bg-primary text-primary-foreground">
                                  <Sword className="h-3 w-3 mr-1" />
                                  {ability}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {card.rewards?.equipment && card.rewards.equipment.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">New Equipment</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {card.rewards.equipment.map((item, i) => (
                                <Badge key={i} variant="outline" className="border-accent text-accent">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {card.rewards?.achievements && card.rewards.achievements.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Achievements</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {card.rewards.achievements.map((achievement, i) => (
                                <Badge key={i} className="bg-accent text-white">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {achievement}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentCard === 0}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Previous
            </Button>

            {/* Progress Dots */}
            <div className="flex gap-2">
              {cards.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentCard
                      ? "w-8 bg-primary"
                      : "w-2 bg-white/30"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              onClick={handleNext}
              className="text-white hover:bg-white/20"
            >
              {isLastCard ? "Close" : "Next"}
              {!isLastCard && <ChevronRight className="h-5 w-5 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

