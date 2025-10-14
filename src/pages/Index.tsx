import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StreakCounter } from "@/components/StreakCounter";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { WorkoutCard } from "@/components/WorkoutCard";
import { AchievementBadge } from "@/components/AchievementBadge";
import { StatCard } from "@/components/StatCard";
import { CustomWorkoutBuilder } from "@/components/CustomWorkoutBuilder";
import { SettingsModal } from "@/components/SettingsModal";
import { PremiumBanner } from "@/components/PremiumBanner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  Plus
} from "lucide-react";
import heroImage from "@/assets/hero-avatars.jpg";

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
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (user) {
      loadData();
    }
  }, [user, authLoading, navigate]);

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
      setAchievements(achievementsData || []);

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

  const handleStartWorkout = (workoutId: string) => {
    if (!user) {
      toast.error("Please sign in to start a workout");
      return;
    }
    navigate(`/workout/${workoutId}`);
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
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background" />
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
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground drop-shadow-lg">
              Welcome Back,
              <span className="block bg-gradient-streak bg-clip-text text-transparent">
                {profile.display_name}!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl">
              Keep the momentum going and crush your fitness goals today.
            </p>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="container mx-auto px-4 py-12 space-y-8">
        {/* Streak and Avatar */}
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
          <StreakCounter streakDays={profile.current_streak} />
          <AvatarDisplay level={profile.level} totalPoints={profile.total_points} />
        </div>

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
            {workouts.map((workout) => (
              <WorkoutCard 
                key={workout.id}
                title={workout.title}
                duration={`${workout.duration_minutes} min`}
                exercises={workout.exercises_count}
                onStart={() => handleStartWorkout(workout.id)}
              />
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Achievements</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = userAchievements.some(
                (ua) => ua.achievement_id === achievement.id
              );
              return (
                <AchievementBadge 
                  key={achievement.id}
                  title={achievement.title}
                  description={achievement.description}
                  unlocked={isUnlocked}
                  icon={achievement.icon_name ? <Award className="h-6 w-6" /> : undefined}
                />
              );
            })}
          </div>
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
    </div>
  );
};

export default Index;
