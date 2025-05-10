import { Helmet } from 'react-helmet';
import { ServerControl } from '@/components/ServerControl';
import { PerformanceMetrics } from '@/components/PerformanceMetrics';
import { OnlinePlayers } from '@/components/OnlinePlayers';
import { ServerConfiguration } from '@/components/ServerConfiguration';
import { WorldStats } from '@/components/WorldStats';
import { ServerConsole } from '@/components/ServerConsole';
import { useQuery } from '@tanstack/react-query';
import { ServerStats } from '@/lib/eaglercraft';

export default function Dashboard() {
  const { data: serverStats } = useQuery<ServerStats>({
    queryKey: ['/api/server/stats'],
    refetchInterval: 5000
  });
  
  return (
    <>
      <Helmet>
        <title>Dashboard | Eaglercraft Server</title>
        <meta name="description" content="Manage your Eaglercraft Minecraft server and monitor server performance, players, and configuration." />
      </Helmet>
      
      <div className="flex-1 overflow-y-auto bg-gray-800 p-4 sm:p-6">
        {/* Server Control Card */}
        <ServerControl />

        {/* Server Stats and Players */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Performance Metrics */}
          <PerformanceMetrics />

          {/* Online Players */}
          <OnlinePlayers />
        </div>

        {/* Server Configuration and World Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Server Configuration */}
          <ServerConfiguration />

          {/* World Stats */}
          <WorldStats />
        </div>

        {/* Server Console */}
        <ServerConsole />
      </div>
    </>
  );
}
