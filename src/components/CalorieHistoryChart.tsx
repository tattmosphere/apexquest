import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Flame } from "lucide-react";

interface CalorieData {
  date: string;
  calories: number;
}

export const CalorieHistoryChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CalorieData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCalorieData = async () => {
      // Get last 30 days of workout data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sessions, error } = await supabase
        .from("workout_sessions")
        .select(`
          started_at,
          workout_session_exercises(calories_burned)
        `)
        .eq("user_id", user.id)
        .gte("started_at", thirtyDaysAgo.toISOString())
        .order("started_at", { ascending: true });

      if (error) {
        console.error("Error fetching calorie data:", error);
        setLoading(false);
        return;
      }

      // Group by date and sum calories
      const caloriesByDate = new Map<string, number>();
      
      sessions?.forEach(session => {
        const date = new Date(session.started_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        const totalCalories = (session.workout_session_exercises as any[])?.reduce(
          (sum, ex) => sum + (ex.calories_burned || 0), 
          0
        ) || 0;
        
        caloriesByDate.set(date, (caloriesByDate.get(date) || 0) + totalCalories);
      });

      const chartData = Array.from(caloriesByDate.entries()).map(([date, calories]) => ({
        date,
        calories: Math.round(calories)
      }));

      setData(chartData);
      setLoading(false);
    };

    fetchCalorieData();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Calories Burned (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Calories Burned (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No workout data yet. Complete a workout to see your calorie burn!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Calories Burned (30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="calories" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
