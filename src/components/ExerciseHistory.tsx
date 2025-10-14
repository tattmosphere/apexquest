import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ExerciseHistoryProps {
  exerciseId: string;
  exerciseName: string;
  open: boolean;
  onClose: () => void;
}

interface PersonalRecord {
  record_type: string;
  value: number;
  achieved_at: string;
}

interface HistoryData {
  date: string;
  maxWeight: number;
  maxReps: number;
  volume: number;
}

export const ExerciseHistory = ({ exerciseId, exerciseName, open, onClose }: ExerciseHistoryProps) => {
  const { user } = useAuth();
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !open) return;

    const fetchData = async () => {
      // Fetch personal records
      const { data: prs, error: prError } = await supabase
        .from("personal_records")
        .select("*")
        .eq("user_id", user.id)
        .eq("exercise_id", exerciseId);

      if (prError) {
        console.error("Error fetching PRs:", prError);
      } else {
        setPersonalRecords(prs || []);
      }

      // Fetch historical workout data
      const { data: sessions, error: sessionError } = await supabase
        .from("workout_session_exercises")
        .select(`
          created_at,
          reps,
          weights,
          workout_sessions!inner(user_id)
        `)
        .eq("exercise_id", exerciseId)
        .eq("workout_sessions.user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(20);

      if (sessionError) {
        console.error("Error fetching history:", sessionError);
      } else {
        const chartData = sessions?.map(session => {
          const reps = session.reps as number[];
          const weights = session.weights as number[];
          const maxWeight = weights ? Math.max(...weights.filter(w => w > 0)) : 0;
          const maxReps = reps ? Math.max(...reps.filter(r => r > 0)) : 0;
          const volume = reps && weights ? 
            reps.reduce((sum, r, i) => sum + r * (weights[i] || 0), 0) : 0;

          return {
            date: new Date(session.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            maxWeight,
            maxReps,
            volume
          };
        }) || [];

        setHistoryData(chartData);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, exerciseId, open]);

  const formatRecordType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {exerciseName} - History & Records
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Personal Records */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Personal Records
              </h3>
              {personalRecords.length === 0 ? (
                <p className="text-muted-foreground">No personal records yet!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {personalRecords.map((pr) => (
                    <div key={pr.record_type} className="bg-accent/50 p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">
                        {formatRecordType(pr.record_type)}
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {pr.value}
                        {pr.record_type === 'max_weight' && ' lbs'}
                        {pr.record_type === 'max_reps' && ' reps'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(pr.achieved_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Charts */}
            {historyData.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Progress Over Time</h3>
                
                {/* Max Weight Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Max Weight</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={historyData}>
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
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="maxWeight" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Volume Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Total Volume</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={historyData}>
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
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="volume" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
