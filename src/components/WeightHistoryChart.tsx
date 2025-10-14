import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Scale } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface WeightData {
  date: string;
  weight: number;
}

export const WeightHistoryChart = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [data, setData] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchWeightData = async () => {
      // For now, we'll get weight from workout sessions
      // In future, could create a dedicated weight_tracking table
      const { data: sessions, error } = await supabase
        .from("workout_session_exercises")
        .select("created_at, user_weight_at_time")
        .not("user_weight_at_time", "is", null)
        .order("created_at", { ascending: true })
        .limit(30);

      if (error) {
        console.error("Error fetching weight data:", error);
        setLoading(false);
        return;
      }

      // Get unique weights by date
      const weightsByDate = new Map<string, number>();
      
      sessions?.forEach(session => {
        const date = new Date(session.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        if (session.user_weight_at_time) {
          weightsByDate.set(date, session.user_weight_at_time);
        }
      });

      const chartData = Array.from(weightsByDate.entries()).map(([date, weight]) => ({
        date,
        weight: Math.round(weight * 10) / 10
      }));

      setData(chartData);
      setLoading(false);
    };

    fetchWeightData();
  }, [user]);

  const weightUnit = (profile as any)?.preferred_units === 'kg' ? 'kg' : 'lbs';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Weight History
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
            <Scale className="h-5 w-5" />
            Weight History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No weight data yet. Update your weight in Settings!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Weight History ({weightUnit})
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
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value} ${weightUnit}`, 'Weight']}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
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
