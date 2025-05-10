import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { controlServer } from '@/lib/eaglercraft';
import { Play, RefreshCw, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ServerControl() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const controlMutation = useMutation({
    mutationFn: controlServer,
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (_, action) => {
      toast({
        title: 'Server Control',
        description: `Server ${action} initiated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/server/stats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to control server: ${error}`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });
  
  const handleControlAction = (action: 'start' | 'stop' | 'restart') => {
    controlMutation.mutate(action);
  };
  
  return (
    <Card className="bg-minecraft-darkstone rounded-lg shadow-lg overflow-hidden mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-minecraft text-xl text-white mb-2">SERVER CONTROL</h3>
            <p className="text-gray-400 mb-4">Manage your Eaglercraft server</p>
          </div>
          <div className="flex space-x-2">
            <Button
              className="minecraft-btn bg-green-600 hover:bg-green-700 text-white font-medium"
              onClick={() => handleControlAction('start')}
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-2" /> Start
            </Button>
            <Button
              className="minecraft-btn bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
              onClick={() => handleControlAction('restart')}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Restart
            </Button>
            <Button
              className="minecraft-btn bg-red-600 hover:bg-red-700 text-white font-medium"
              onClick={() => handleControlAction('stop')}
              disabled={isLoading}
            >
              <Square className="h-4 w-4 mr-2" /> Stop
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
