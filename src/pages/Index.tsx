import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StreakCounter } from "@/components/StreakCounter";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { WorkoutCard } from "@/components/WorkoutCard";
import { AchievementBadge } from "@/components/AchievementBadge";
import { SortableAchievementBadge } from "@/components/SortableAchievementBadge";
import { StatCard } from "@/components/StatCard";
import { CustomWorkoutBuilder } from "@/components/CustomWorkoutBuilder";
import { SettingsModal } from "@/components/SettingsModal";
import { PremiumBanner } from "@/components/PremiumBanner";
import { WorkoutSessionDialog } from "@/components/WorkoutSessionDialog";
import { WorkoutEditDialog } from "@/components/WorkoutEditDialog";
import { QuickWorkoutDialog } from "@/components/QuickWorkoutDialog";
import { LogPastWorkoutDialog } from "@/components/LogPastWorkoutDialog";
import { CharacterCreationDialog } from "@/components/CharacterCreationDialog";
import { DailyQuestsCard } from "@/components/DailyQuestsCard";
import { AbilityTreeDialog } from "@/components/AbilityTreeDialog";
import { StoryModeDialog } from "@/components/StoryModeDialog";
import { StoryProgressCard } from "@/components/StoryProgressCard";
import { StoryCardViewer } from "@/components/StoryCardViewer";
import { getChapter } from "@/data/storyChapters";
import { ShopDialog } from "@/components/ShopDialog";
import { useCharacter } from "@/hooks/useCharacter";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { 
  Flame, 
  Trophy, 
  Target, 
  Dumbbell,
  Calendar,
  Zap,
  Award,
  LogOut,
  Settings,
  Plus,
  Play,
  History,
  BookOpen,
  ShoppingBag
} from "lucide-react";
// Using hero banner from public folder
const heroImage = "/hero-banner.png";

interface Workout {
  id: string;
  title: string;
  duration_minutes: number;
  exercises_count: number;
  category: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  icon_name: string | null;
}

interface UserAchievement {
  achievement_id: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementOrder, setAchievementOrder] = useState<string[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [hiddenWorkouts, setHiddenWorkouts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [activeWorkoutTitle, setActiveWorkoutTitle] = useState<string>("");
  const [editWorkoutId, setEditWorkoutId] = useState<string | null>(null);
  const [showQuickWorkout, setShowQuickWorkout] = useState(false);
  const [showLogPast, setShowLogPast] = useState(false);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showStoryCards, setShowStoryCards] = useState(false);
  const [currentStoryChapter, setCurrentStoryChapter] = useState(1);
  const [showShop, setShowShop] = useState(false);
  const { character } = useCharacter();
  const { quests } = useDailyQuests();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAchievementOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save to localStorage
        localStorage.setItem('achievementOrder', JSON.stringify(newOrder));
        
        return newOrder;
      });
    }
  };

  const orderedAchievements = achievementOrder
    .map(id => achievements.find(a => a.id === id))
    .filter((a): a is Achievement => a !== undefined);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (user) {
      loadData();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Only show character creation if:
    // 1. Profile exists (user is logged in)
    // 2. Character is null (no character created yet)
    // 3. Dialog is not already open (prevent reopening)
    if (profile && !character && !showCharacterCreation) {
      setShowCharacterCreation(true);
    }
    // Close dialog if character was created
    if (character && showCharacterCreation) {
      setShowCharacterCreation(false);
    }
  }, [profile, character]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load workouts (including custom ones)
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workouts")
        .select("*")
        .or(`is_custom.eq.false,user_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (workoutsError) throw workoutsError;
      setWorkouts(workoutsData || []);

      // Load achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from("achievements")
        .select("*");

      if (achievementsError) throw achievementsError;
      const achievementsList = achievementsData || [];
      setAchievements(achievementsList);
      
      // Load saved order from localStorage or initialize with default order
      const savedOrder = localStorage.getItem('achievementOrder');
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          // Filter to only include valid achievement IDs
          const validOrder = parsedOrder.filter((id: string) => 
            achievementsList.some(a => a.id === id)
          );
          // Add any new achievements that aren't in the saved order
          const newIds = achievementsList
            .filter(a => !validOrder.includes(a.id))
            .map(a => a.id);
          setAchievementOrder([...validOrder, ...newIds]);
        } catch {
          setAchievementOrder(achievementsList.map(a => a.id));
        }
      } else {
        setAchievementOrder(achievementsList.map(a => a.id));
      }

      // Load user achievements
      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from("user_achievements")
        .select("*, achievements(*)")
        .eq("user_id", user.id);

      if (userAchievementsError) throw userAchievementsError;
      setUserAchievements(userAchievementsData || []);

      // Load workout logs
      const { data: logsData, error: logsError } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (logsError) throw logsError;
      setWorkoutLogs(logsData || []);

      // Load hidden workouts
      const { data: hiddenData, error: hiddenError } = await supabase
        .from("hidden_workouts")
        .select("workout_id")
        .eq("user_id", user.id);

      if (hiddenError) throw hiddenError;
      setHiddenWorkouts(new Set(hiddenData?.map(h => h.workout_id) || []));
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch workouts
        const { data: workoutsData } = await supabase
          .from("workouts")
          .select("*")
          .limit(3);
        
        if (workoutsData) setWorkouts(workoutsData);

        // Fetch achievements
        const { data: achievementsData } = await supabase
          .from("achievements")
          .select("*")
          .limit(6);
        
        if (achievementsData) setAchievements(achievementsData);

        // Fetch user achievements
        const { data: userAchievementsData } = await supabase
          .from("user_achievements")
          .select("achievement_id")
          .eq("user_id", user.id);
        
        if (userAchievementsData) setUserAchievements(userAchievementsData);

        // Fetch workout logs
        const { data: logsData } = await supabase
          .from("workout_logs")
          .select("*")
          .eq("user_id", user.id);
        
        if (logsData) setWorkoutLogs(logsData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleStartWorkout = (workoutId: string, workoutTitle: string) => {
    if (!user) {
      toast.error("Please sign in to start a workout");
      return;
    }
    setActiveWorkoutId(workoutId);
    setActiveWorkoutTitle(workoutTitle);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);

      if (error) throw error;

      toast.success("Workout deleted");
      loadData();
    } catch (error: any) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout");
    }
  };

  const handleHideWorkout = async (workoutId: string) => {
    try {
      const { error } = await supabase
        .from("hidden_workouts")
        .insert({ user_id: user!.id, workout_id: workoutId });

      if (error) throw error;

      toast.success("Workout hidden from your list");
      loadData();
    } catch (error: any) {
      console.error("Error hiding workout:", error);
      toast.error("Failed to hide workout");
    }
  };

  const checkAchievements = async () => {
    if (!user || !profile) return;

    const totalWorkouts = workoutLogs.length + 1; // +1 for the workout just logged

    // Check workout count achievements
    const workoutCountAchievements = achievements.filter(
      (a) => a.icon_name === "Zap" && !userAchievements.some((ua) => ua.achievement_id === a.id)
    );

    for (const achievement of workoutCountAchievements) {
      await supabase.from("user_achievements").insert({
        user_id: user.id,
        achievement_id: achievement.id,
      });
      toast.success(`Achievement unlocked: ${achievement.title}! 🏆`);
    }

    // Check streak achievements
    if (profile.current_streak >= 7) {
      const weekWarrior = achievements.find((a) => a.title === "Week Warrior");
      if (weekWarrior && !userAchievements.some((ua) => ua.achievement_id === weekWarrior.id)) {
        await supabase.from("user_achievements").insert({
          user_id: user.id,
          achievement_id: weekWarrior.id,
        });
        toast.success(`Achievement unlocked: ${weekWarrior.title}! 🔥`);
      }
    }

    if (profile.current_streak >= 14) {
      const twoWeekChamp = achievements.find((a) => a.title === "Two Week Champion");
      if (twoWeekChamp && !userAchievements.some((ua) => ua.achievement_id === twoWeekChamp.id)) {
        await supabase.from("user_achievements").insert({
          user_id: user.id,
          achievement_id: twoWeekChamp.id,
        });
        toast.success(`Achievement unlocked: ${twoWeekChamp.title}! 🏆`);
      }
    }
  };

  if (authLoading || profileLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your fitness journey...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const weeklyWorkouts = workoutLogs.filter((log) => {
    const logDate = new Date(log.workout_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Fitness avatars" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between w-full max-w-2xl mb-4">
              <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30">
                <Flame className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-primary-foreground">
                  {profile.current_streak} Day Streak!
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowSettings(true)}
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={async () => {
                    await signOut();
                    navigate("/auth");
                  }} 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              Welcome Back,
              <span className="block text-accent drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {profile.display_name}!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] max-w-2xl">
              Keep the momentum going and crush your fitness goals today.
            </p>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="container mx-auto px-4 py-12 space-y-8">
        {/* Streak, Avatar, and Quests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="space-y-6">
            <StreakCounter streakDays={profile.current_streak} />
            {character && <DailyQuestsCard />}
          </div>
          <div className="space-y-6">
            <AvatarDisplay level={profile.level} totalPoints={profile.total_points} currentChapter={currentStoryChapter} />
            {character && (
              <StoryProgressCard
                currentChapter={currentStoryChapter}
                chapterProgress={100}
                userClass={character.class_type}
                onViewStory={() => {
                  setShowStoryCards(true);
                }}
              />
            )}
          </div>
        </div>

        {/* RPG Features */}
        {character && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <Card 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-card"
              onClick={() => setShowAbilities(true)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Abilities</h3>
                  <p className="text-sm text-muted-foreground">View skill tree</p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-card"
              onClick={() => setShowShop(true)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Shop</h3>
                  <p className="text-sm text-muted-foreground">{character.survival_credits} SC</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <StatCard 
            title="Total Workouts"
            value={workoutLogs.length}
            icon={Dumbbell}
          />
          <StatCard 
            title="This Week"
            value={weeklyWorkouts}
            icon={Calendar}
          />
          <StatCard 
            title="Achievements"
            value={userAchievements.length}
            icon={Trophy}
          />
          <StatCard 
            title="Longest Streak"
            value={`${profile.longest_streak}d`}
            icon={Flame}
          />
        </div>

        {/* Premium Banner */}
        <PremiumBanner />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowQuickWorkout(true)}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Workout</h3>
                <p className="text-sm text-muted-foreground">Start tracking a cardio session now</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowLogPast(true)}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <History className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Log Past Workout</h3>
                <p className="text-sm text-muted-foreground">Add a workout from earlier today</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Workouts */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Available Workouts</h2>
            <Button
              onClick={() => setShowCustomBuilder(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Custom
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts
              .filter(workout => !hiddenWorkouts.has(workout.id))
              .map((workout) => (
                <WorkoutCard 
                  key={workout.id}
                  title={workout.title}
                  duration={`${workout.duration_minutes} min`}
                  exercises={workout.exercises_count}
                  onStart={() => handleStartWorkout(workout.id, workout.title)}
                  isCustom={(workout as any).is_custom && (workout as any).user_id === user?.id}
                  onEdit={() => setEditWorkoutId(workout.id)}
                  onDelete={() => handleDeleteWorkout(workout.id)}
                  onHide={() => handleHideWorkout(workout.id)}
                />
              ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Achievements</h2>
            <p className="text-sm text-muted-foreground">Drag to reorder</p>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={achievementOrder} strategy={rectSortingStrategy}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orderedAchievements.map((achievement) => {
                  const isUnlocked = userAchievements.some(
                    (ua) => ua.achievement_id === achievement.id
                  );
                  return (
                    <SortableAchievementBadge
                      key={achievement.id}
                      id={achievement.id}
                      title={achievement.title}
                      description={achievement.description}
                      unlocked={isUnlocked}
                      icon={achievement.icon_name ? <Award className="h-6 w-6" /> : undefined}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </section>

      {/* Motivational CTA */}
      {profile.current_streak > 0 && (
        <section className="container mx-auto px-4 py-16">
          <Card className="relative overflow-hidden bg-gradient-primary p-12 text-center shadow-elevated border-0">
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                Don't Break Your Streak!
              </h2>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                You're on fire with a {profile.current_streak}-day streak. Keep the momentum going!
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-glow/20 rounded-full blur-3xl animate-pulse-glow" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-glow/20 rounded-full blur-3xl animate-pulse-glow" />
          </Card>
        </section>
      )}

      <CustomWorkoutBuilder
        open={showCustomBuilder}
        onClose={() => setShowCustomBuilder(false)}
        onWorkoutCreated={loadData}
      />

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {activeWorkoutId && (
        <WorkoutSessionDialog
          open={!!activeWorkoutId}
          onClose={() => {
            setActiveWorkoutId(null);
            setActiveWorkoutTitle("");
            loadData();
          }}
          workoutId={activeWorkoutId}
          workoutTitle={activeWorkoutTitle}
        />
      )}

      <WorkoutEditDialog
        open={!!editWorkoutId}
        onClose={() => setEditWorkoutId(null)}
        workoutId={editWorkoutId}
        onWorkoutUpdated={loadData}
      />

      <QuickWorkoutDialog
        open={showQuickWorkout}
        onOpenChange={setShowQuickWorkout}
        userId={user.id}
        userWeight={profile.body_weight_lbs || 150}
        onWorkoutComplete={loadData}
      />

      <LogPastWorkoutDialog
        open={showLogPast}
        onOpenChange={setShowLogPast}
        userId={user.id}
        userWeight={profile.body_weight_lbs || 150}
        onWorkoutLogged={loadData}
      />

      <CharacterCreationDialog 
        open={showCharacterCreation}
        onOpenChange={setShowCharacterCreation}
        onCharacterCreated={() => {
          setShowCharacterCreation(false);
          loadData();
        }}
      />
      
      <AbilityTreeDialog 
        open={showAbilities}
        onOpenChange={setShowAbilities}
      />
      
      <StoryModeDialog 
        open={showStory}
        onOpenChange={setShowStory}
      />
      
      {getChapter(currentStoryChapter) && (
        <StoryCardViewer
          open={showStoryCards}
          onOpenChange={setShowStoryCards}
          chapterNumber={currentStoryChapter}
          chapterTitle={getChapter(currentStoryChapter)!.title}
          cards={getChapter(currentStoryChapter)!.cards}
        />
      )}
      
      <ShopDialog 
        open={showShop}
        onOpenChange={setShowShop}
      />
    </div>
  );
};

export default Index;
