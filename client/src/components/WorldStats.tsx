import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { WorldStats as WorldStatsType, formatBytes } from '@/lib/eaglercraft';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export function WorldStats() {
  const { toast } = useToast();
  
  const { data: worldStats, isLoading } = useQuery<WorldStatsType>({
    queryKey: ['/api/world/stats'],
    refetchInterval: 10000,
  });
  
  const handleBackupWorld = () => {
    toast({
      title: 'World Backup',
      description: 'World backup function not implemented yet.',
    });
  };
  
  const handleResetWorld = () => {
    toast({
      title: 'World Reset',
      description: 'World reset function not implemented yet.',
      variant: 'destructive',
    });
  };
  
  return (
    <Card className="bg-minecraft-darkstone rounded-lg shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-minecraft text-lg text-white mb-4">WORLD STATISTICS</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Seed */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <span className="block text-gray-400 text-sm">Seed</span>
            {isLoading ? (
              <Skeleton className="h-4 w-full mt-1" />
            ) : (
              <span className="text-white font-mono">{worldStats?.seed || 'Unknown'}</span>
            )}
          </div>
          
          {/* Size */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <span className="block text-gray-400 text-sm">World Size</span>
            {isLoading ? (
              <Skeleton className="h-4 w-24 mt-1" />
            ) : (
              <span className="text-white">{worldStats ? formatBytes(worldStats.size) : 'Unknown'}</span>
            )}
          </div>
          
          {/* Spawn Location */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <span className="block text-gray-400 text-sm">Spawn Location</span>
            {isLoading ? (
              <Skeleton className="h-4 w-40 mt-1" />
            ) : (
              <span className="text-white">
                X: {worldStats?.spawnX || 0}, Y: {worldStats?.spawnY || 64}, Z: {worldStats?.spawnZ || 0}
              </span>
            )}
          </div>
          
          {/* Loaded Chunks */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <span className="block text-gray-400 text-sm">Loaded Chunks</span>
            {isLoading ? (
              <Skeleton className="h-4 w-20 mt-1" />
            ) : (
              <span className="text-white">{worldStats?.loadedChunks || 0} chunks</span>
            )}
          </div>
        </div>
        
        {/* World Map */}
        <div className="bg-minecraft-black p-4 rounded-lg">
          <h4 className="text-gray-200 font-medium mb-3">World Map Preview</h4>
          <div className="relative h-48 overflow-hidden rounded bg-minecraft-darkgreen">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-4 py-2 bg-minecraft-black bg-opacity-75 text-white rounded">Map view not available</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button 
            className="py-2 bg-minecraft-green text-white rounded font-medium hover:bg-minecraft-darkgreen transition"
            onClick={handleBackupWorld}
          >
            Backup World
          </Button>
          <Button 
            className="py-2 bg-gray-700 text-white rounded font-medium hover:bg-gray-600 transition"
            onClick={handleResetWorld}
          >
            Reset World
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
