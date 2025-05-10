import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ServerStats, formatUptime } from '@/lib/eaglercraft';

export function Sidebar() {
  const [location] = useLocation();
  
  const { data: serverStats } = useQuery<ServerStats>({
    queryKey: ['/api/server/stats'],
    refetchInterval: 5000
  });
  
  // Check if status indicator should be pulsing
  const statusClass = serverStats?.status === 'online' 
    ? 'bg-green-500' 
    : serverStats?.status === 'starting' || serverStats?.status === 'stopping'
      ? 'bg-yellow-500' 
      : 'bg-red-500';
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-minecraft-darkstone border-r border-minecraft-black">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 bg-minecraft-black">
          <h1 className="font-minecraft text-green-400 text-sm">Eaglercraft Server</h1>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link href="/">
              <a className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location === '/' ? 'bg-minecraft-green text-white' : 'text-gray-300 hover:bg-minecraft-green hover:text-white'
              } group`}>
                <i className="fas fa-home mr-3 h-4 w-4"></i>
                Dashboard
              </a>
            </Link>

            <Link href="/players">
              <a className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location === '/players' ? 'bg-minecraft-green text-white' : 'text-gray-300 hover:bg-minecraft-green hover:text-white'
              } group`}>
                <i className="fas fa-users mr-3 h-4 w-4"></i>
                Players
              </a>
            </Link>

            <Link href="/config">
              <a className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location === '/config' ? 'bg-minecraft-green text-white' : 'text-gray-300 hover:bg-minecraft-green hover:text-white'
              } group`}>
                <i className="fas fa-cogs mr-3 h-4 w-4"></i>
                Server Config
              </a>
            </Link>

            <Link href="/console">
              <a className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location === '/console' ? 'bg-minecraft-green text-white' : 'text-gray-300 hover:bg-minecraft-green hover:text-white'
              } group`}>
                <i className="fas fa-terminal mr-3 h-4 w-4"></i>
                Console
              </a>
            </Link>
          </nav>
        </div>

        {/* Server Status */}
        <div className="p-4 bg-minecraft-black">
          <div className="flex items-center">
            <div className={`w-3 h-3 ${statusClass} rounded-full mr-2 ${
              serverStats?.status === 'online' ? 'animate-pulse' : ''
            }`}></div>
            <span className="text-sm font-medium">
              Server {serverStats?.status || 'Unknown'}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <div>Uptime: {serverStats ? formatUptime(serverStats.uptime) : 'N/A'}</div>
            <div>Version: {serverStats?.version || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
