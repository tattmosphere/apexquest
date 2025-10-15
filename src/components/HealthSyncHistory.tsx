import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SyncLog {
  id: string;
  sync_type: 'import' | 'export';
  data_type: string;
  platform: string;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
  synced_at: string;
  metadata: any;
}

export const HealthSyncHistory = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadLogs = async () => {
      const { data, error } = await supabase
        .from('health_sync_log')
        .select('*')
        .eq('user_id', user.id)
        .order('synced_at', { ascending: false })
        .limit(50);

      if (data && !error) {
        setLogs(data as SyncLog[]);
      }
      setLoading(false);
    };

    loadLogs();

    // Subscribe to new logs
    const channel = supabase
      .channel('health-sync-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_sync_log',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSyncIcon = (syncType: string) => {
    return syncType === 'import' ? (
      <ArrowDownToLine className="h-4 w-4 text-primary" />
    ) : (
      <ArrowUpFromLine className="h-4 w-4 text-primary" />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading sync history...</p>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Sync History</CardTitle>
          <CardDescription>Your health sync activity will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No sync activity yet. Enable health sync to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Sync History</CardTitle>
        <CardDescription>Recent sync activity with Health</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2">
                  {getSyncIcon(log.sync_type)}
                  {getStatusIcon(log.status)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {log.sync_type} {log.data_type.replace('_', ' ')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {log.platform}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.synced_at), { addSuffix: true })}
                  </p>
                  
                  {log.error_message && (
                    <p className="text-sm text-destructive">{log.error_message}</p>
                  )}
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {log.metadata.calories && `${log.metadata.calories} cal`}
                      {log.metadata.duration && ` • ${log.metadata.duration} min`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
