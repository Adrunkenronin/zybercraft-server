import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { MessageSquare, Ban } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ServerStats } from '@/lib/eaglercraft';

type Player = {
  id: number;
  username: string;
  lastLogin: string;
  lastIp: string;
  isOp: boolean;
  playTime: number;
  banned: boolean;
};

export function OnlinePlayers() {
  const { data: stats, isLoading: statsLoading } = useQuery<ServerStats>({
    queryKey: ['/api/server/stats'],
    refetchInterval: 5000,
  });
  
  const { data: players, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ['/api/server/players'],
    refetchInterval: 5000,
  });
  
  const onlinePlayers = players?.filter(p => p.lastLogin && !p.banned) || [];
  
  return (
    <Card className="bg-minecraft-darkstone rounded-lg shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-minecraft text-lg text-white">ONLINE PLAYERS</h3>
          {statsLoading ? (
            <Skeleton className="h-6 w-12" />
          ) : (
            <span className="bg-minecraft-green px-2 py-1 rounded text-sm font-medium">
              {stats?.players.online || 0}/{stats?.players.max || 20}
            </span>
          )}
        </div>
        
        {/* Player List */}
        <div className="space-y-2">
          {playersLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-minecraft-black rounded-lg p-3">
                <div className="flex items-center">
                  <Skeleton className="w-8 h-8 mr-3 rounded" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : onlinePlayers.length > 0 ? (
            onlinePlayers.slice(0, 3).map((player) => (
              <div key={player.id} className="bg-minecraft-black rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center">
                  {/* Using a simple colored square as avatar since we can't use images */}
                  <div className="w-8 h-8 mr-3 rounded bg-minecraft-green flex items-center justify-center text-white font-bold">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium">{player.username}</span>
                    <div className="text-xs text-gray-400">
                      {player.isOp ? 'OP' : 'Player'} · Just now
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-white">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-white">
                    <Ban className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-minecraft-black rounded-lg p-3 text-center text-gray-400">
              No players online
            </div>
          )}
          
          <Link href="/players">
            <Button className="w-full py-2 mt-2 bg-minecraft-green text-white rounded font-medium hover:bg-minecraft-darkgreen transition">
              View All Players
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
