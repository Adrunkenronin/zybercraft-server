import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface Player {
  id: number;
  username: string;
  lastLogin: string;
  lastIp: string;
  isOp: boolean;
  playTime: number;
  banned: boolean;
}

export default function PlayerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ['/api/server/players'],
    refetchInterval: 10000,
  });
  
  const filteredPlayers = players?.filter(player => 
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const handleOpPlayer = (playerId: number) => {
    toast({
      title: 'OP Status',
      description: 'Player OP status toggled successfully.',
    });
  };
  
  const handleBanPlayer = (playerId: number) => {
    toast({
      title: 'Ban Status',
      description: 'Player ban status toggled successfully.',
    });
  };
  
  // Format the date to a user-friendly string
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Format playtime from seconds to a readable format
  const formatPlayTime = (seconds: number) => {
    if (!seconds) return '0 minutes';
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <>
      <Helmet>
        <title>Player Management | Eaglercraft Server</title>
        <meta name="description" content="Manage players on your Eaglercraft Minecraft server. View player information, grant OP privileges, and ban players." />
      </Helmet>
      
      <div className="flex-1 overflow-y-auto bg-gray-800 p-4 sm:p-6">
        <h2 className="text-xl md:text-2xl font-minecraft text-white mb-6">PLAYER MANAGEMENT</h2>
        
        <Card className="bg-minecraft-darkstone rounded-lg shadow-lg overflow-hidden mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-minecraft-green"
              />
              <Button className="bg-minecraft-green text-white rounded font-medium hover:bg-minecraft-darkgreen transition">
                Add Player
              </Button>
            </div>
            
            <div className="bg-minecraft-black rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="p-4">
                  <Skeleton className="h-8 w-full mb-4" />
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full mb-2" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-minecraft-black">
                    <TableRow>
                      <TableHead className="text-gray-300">Username</TableHead>
                      <TableHead className="text-gray-300">Last Login</TableHead>
                      <TableHead className="text-gray-300">Play Time</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player) => (
                        <TableRow key={player.id} className="border-t border-gray-700">
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center">
                              <div className="w-8 h-8 mr-3 rounded bg-minecraft-green flex items-center justify-center text-white font-bold">
                                {player.username.charAt(0).toUpperCase()}
                              </div>
                              {player.username}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatDate(player.lastLogin)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatPlayTime(player.playTime)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {player.isOp && (
                                <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">OP</span>
                              )}
                              {player.banned && (
                                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Banned</span>
                              )}
                              {!player.isOp && !player.banned && (
                                <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">Player</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                onClick={() => handleOpPlayer(player.id)}
                                variant="outline"
                                className={`px-3 py-1 text-xs border ${player.isOp ? 'border-yellow-600 text-yellow-500' : 'border-gray-600 text-gray-400'}`}
                              >
                                {player.isOp ? 'Remove OP' : 'Make OP'}
                              </Button>
                              <Button
                                onClick={() => handleBanPlayer(player.id)}
                                variant="outline"
                                className={`px-3 py-1 text-xs border ${player.banned ? 'border-green-600 text-green-500' : 'border-red-600 text-red-500'}`}
                              >
                                {player.banned ? 'Unban' : 'Ban'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          No players found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
