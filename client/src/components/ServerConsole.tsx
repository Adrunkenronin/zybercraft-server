import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { executeCommand } from '@/lib/eaglercraft';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimestamp } from '@/lib/eaglercraft';

type ServerLog = {
  id: number;
  timestamp: string;
  level: string;
  message: string;
};

export function ServerConsole() {
  const [command, setCommand] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: logs, isLoading } = useQuery<ServerLog[]>({
    queryKey: ['/api/server/logs'],
    refetchInterval: 2000,
  });
  
  const commandMutation = useMutation({
    mutationFn: executeCommand,
    onSuccess: () => {
      setCommand('');
      queryClient.invalidateQueries({ queryKey: ['/api/server/logs'] });
    },
    onError: (error) => {
      toast({
        title: 'Command Error',
        description: `Failed to execute command: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleExecuteCommand = () => {
    if (!command.trim()) return;
    commandMutation.mutate(command);
  };
  
  // Auto-scroll to bottom when logs change
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);
  
  const getLogColorClass = (level: string) => {
    switch (level.toUpperCase()) {
      case 'INFO': return 'text-gray-400';
      case 'WARN': return 'text-yellow-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-white';
    }
  };
  
  return (
    <Card className="mt-6 bg-minecraft-darkstone rounded-lg shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-minecraft text-lg text-white mb-4">SERVER CONSOLE</h3>
        
        <div 
          ref={consoleRef}
          className="bg-minecraft-black p-3 rounded-lg h-64 overflow-y-auto mb-4 font-mono text-sm"
        >
          {isLoading ? (
            <div className="space-y-2">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className={getLogColorClass(log.level)}>
                  [{formatTimestamp(log.timestamp)}] [{log.level}]: {log.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">No logs available</div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Input 
            type="text" 
            placeholder="Enter command..." 
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleExecuteCommand()}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-minecraft-green"
          />
          <Button 
            className="bg-minecraft-green px-4 py-2 rounded font-medium hover:bg-minecraft-darkgreen transition"
            onClick={handleExecuteCommand}
            disabled={commandMutation.isPending}
          >
            Execute
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
