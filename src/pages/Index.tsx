import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StreakCounter } from "@/components/StreakCounter";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { WorkoutCard } from "@/components/WorkoutCard";
import { AchievementBadge } from "@/components/AchievementBadge";
import { StatCard } from "@/components/StatCard";
import { 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp, 
  Dumbbell,
  Calendar,
  Zap,
  Award
} from "lucide-react";
import heroImage from "@/assets/hero-fitness.jpg";

const Index = () => {
  // Mock data - in a real app, this would come from your backend/state management
  const streakDays = 14;
  const userLevel = 5;
  const totalPoints = 487;
  
  const handleStartWorkout = (workoutName: string) => {
    console.log(`Starting workout: ${workoutName}`);
    // In a real app, navigate to workout logging screen
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Fitness motivation" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background" />
        </div>
        <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/30">
              <Flame className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">Make Fitness Addictive</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground drop-shadow-lg">
              Build Your
              <span className="block bg-gradient-streak bg-clip-text text-transparent">
                Fitness Streak
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl">
              Track workouts, earn achievements, and stay motivated with the fitness app that makes consistency fun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="hero" size="xl" className="group">
                <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                Start Your Journey
              </Button>
              <Button variant="outline" size="xl" className="bg-background/20 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-background/30">
                <Trophy className="h-5 w-5 mr-2" />
                View Achievements
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="container mx-auto px-4 py-12 space-y-8">
        {/* Streak and Avatar */}
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
          <StreakCounter streakDays={streakDays} />
          <AvatarDisplay level={userLevel} totalPoints={totalPoints} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <StatCard 
            title="Total Workouts"
            value={48}
            icon={Dumbbell}
            trend="+12% this month"
          />
          <StatCard 
            title="This Week"
            value={5}
            icon={Calendar}
            trend="2 more to goal"
          />
          <StatCard 
            title="Personal Records"
            value={8}
            icon={Trophy}
          />
          <StatCard 
            title="Weekly Goal"
            value="83%"
            icon={Target}
            trend="Almost there!"
          />
        </div>

        {/* Today's Workouts */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Today's Workouts</h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <WorkoutCard 
              title="Upper Body Strength"
              duration="45 min"
              exercises={8}
              onStart={() => handleStartWorkout("Upper Body Strength")}
            />
            <WorkoutCard 
              title="HIIT Cardio"
              duration="30 min"
              exercises={6}
              onStart={() => handleStartWorkout("HIIT Cardio")}
            />
            <WorkoutCard 
              title="Core & Abs"
              duration="20 min"
              exercises={5}
              onStart={() => handleStartWorkout("Core & Abs")}
            />
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Achievements</h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AchievementBadge 
              title="Two Week Warrior"
              description="Complete a 14-day workout streak"
              unlocked={true}
              icon={<Flame className="h-6 w-6 text-accent-foreground" />}
            />
            <AchievementBadge 
              title="Heavy Lifter"
              description="Lift a total of 10,000 lbs"
              unlocked={true}
              icon={<Dumbbell className="h-6 w-6 text-accent-foreground" />}
            />
            <AchievementBadge 
              title="Speed Demon"
              description="Complete 50 HIIT workouts"
              unlocked={false}
              icon={<Zap className="h-6 w-6" />}
            />
            <AchievementBadge 
              title="Consistency King"
              description="Work out 5 days a week for a month"
              unlocked={false}
              icon={<Trophy className="h-6 w-6" />}
            />
            <AchievementBadge 
              title="Personal Best"
              description="Set 10 personal records"
              unlocked={true}
              icon={<Award className="h-6 w-6 text-accent-foreground" />}
            />
            <AchievementBadge 
              title="Progressive Overload"
              description="Increase weight by 25% on any exercise"
              unlocked={false}
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Motivational CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="relative overflow-hidden bg-gradient-primary p-12 text-center shadow-elevated border-0">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Don't Break Your Streak!
            </h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
              You're on fire with a {streakDays}-day streak. Keep the momentum going and crush your fitness goals.
            </p>
            <Button variant="streak" size="xl" className="mt-6">
              <Flame className="h-5 w-5 mr-2" />
              Log Today's Workout
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-glow/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-glow/20 rounded-full blur-3xl animate-pulse-glow" />
        </Card>
      </section>
    </div>
  );
};

export default Index;
