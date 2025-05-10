import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { ServerStats, formatBytes } from '@/lib/eaglercraft';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export function PerformanceMetrics() {
  const { data: stats, isLoading } = useQuery<ServerStats>({
    queryKey: ['/api/server/stats'],
    refetchInterval: 2000,
  });
  
  return (
    <Card className="bg-minecraft-darkstone rounded-lg shadow-lg overflow-hidden lg:col-span-2">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-minecraft text-lg text-white mb-4">PERFORMANCE METRICS</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* CPU Usage */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">CPU Usage</span>
              {isLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <span className="text-white font-medium">{stats?.cpuUsage || 0}%</span>
              )}
            </div>
            <Progress value={stats?.cpuUsage || 0} className="bg-gray-700 h-2.5" indicatorClassName="bg-blue-500" />
          </div>
          
          {/* Memory Usage */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Memory</span>
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span className="text-white font-medium">
                  {stats ? `${formatBytes(stats.memoryUsage.used)} / ${formatBytes(stats.memoryUsage.total)}` : '0MB / 0MB'}
                </span>
              )}
            </div>
            <Progress 
              value={stats ? (stats.memoryUsage.used / stats.memoryUsage.total) * 100 : 0} 
              className="bg-gray-700 h-2.5" 
              indicatorClassName="bg-green-500" 
            />
          </div>
          
          {/* TPS */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">TPS</span>
              {isLoading ? (
                <Skeleton className="h-4 w-12" />
              ) : (
                <span className="text-white font-medium">{stats?.tps.toFixed(1) || 0}</span>
              )}
            </div>
            <Progress 
              value={stats ? (stats.tps / 20) * 100 : 0} 
              className="bg-gray-700 h-2.5" 
              indicatorClassName="bg-yellow-500" 
            />
          </div>
        </div>
        
        {/* Performance Graph */}
        <div className="bg-minecraft-black p-4 rounded-lg">
          <h4 className="text-gray-200 font-medium mb-4">Server Performance History</h4>
          <div className="h-48 w-full flex items-end space-x-2">
            {Array(12).fill(0).map((_, i) => {
              // Generate random heights for demonstration
              const height = 20 + Math.floor(Math.random() * 30);
              return (
                <div 
                  key={i} 
                  className="bg-minecraft-green rounded-t" 
                  style={{ height: `${height}%`, width: 'full' }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>1h ago</span>
            <span>30m ago</span>
            <span>Now</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
