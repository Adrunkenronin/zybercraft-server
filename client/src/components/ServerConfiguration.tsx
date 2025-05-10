import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateServerConfig } from '@/lib/eaglercraft';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type ServerConfig = {
  id: number;
  key: string;
  value: string;
};

export function ServerConfiguration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [gameMode, setGameMode] = useState('survival');
  const [difficulty, setDifficulty] = useState('normal');
  const [maxPlayers, setMaxPlayers] = useState('20');
  const [pvpEnabled, setPvpEnabled] = useState(true);
  const [spawnProtection, setSpawnProtection] = useState(16);
  
  const { data: configItems, isLoading } = useQuery<ServerConfig[]>({
    queryKey: ['/api/server/config'],
    onSuccess: (data) => {
      // Set initial values from server
      const gameModeConfig = data.find(item => item.key === 'gameMode');
      if (gameModeConfig) setGameMode(gameModeConfig.value);
      
      const difficultyConfig = data.find(item => item.key === 'difficulty');
      if (difficultyConfig) setDifficulty(difficultyConfig.value);
      
      const maxPlayersConfig = data.find(item => item.key === 'maxPlayers');
      if (maxPlayersConfig) setMaxPlayers(maxPlayersConfig.value);
      
      const pvpConfig = data.find(item => item.key === 'pvp');
      if (pvpConfig) setPvpEnabled(pvpConfig.value === 'true');
      
      const spawnProtectionConfig = data.find(item => item.key === 'spawnProtection');
      if (spawnProtectionConfig) setSpawnProtection(parseInt(spawnProtectionConfig.value));
    }
  });
  
  const updateConfigMutation = useMutation({
    mutationFn: async () => {
      await updateServerConfig('gameMode', gameMode);
      await updateServerConfig('difficulty', difficulty);
      await updateServerConfig('maxPlayers', maxPlayers);
      await updateServerConfig('pvp', pvpEnabled ? 'true' : 'false');
      await updateServerConfig('spawnProtection', spawnProtection.toString());
    },
    onSuccess: () => {
      toast({
        title: 'Configuration saved',
        description: 'Server configuration has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/server/config'] });
    },
    onError: (error) => {
      toast({
        title: 'Error saving configuration',
        description: `Failed to save configuration: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleSaveConfig = () => {
    updateConfigMutation.mutate();
  };
  
  if (isLoading) {
    return (
      <Card className="bg-minecraft-darkstone rounded-lg shadow-lg overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-minecraft text-lg text-white mb-4">SERVER CONFIGURATION</h3>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-minecraft-black p-4 rounded-lg">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-minecraft-darkstone rounded-lg shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-minecraft text-lg text-white mb-4">SERVER CONFIGURATION</h3>
        
        <div className="space-y-4">
          {/* Game Mode */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <Label className="block text-sm font-medium text-gray-400 mb-2">Game Mode</Label>
            <Select value={gameMode} onValueChange={setGameMode}>
              <SelectTrigger className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-minecraft-green">
                <SelectValue placeholder="Select game mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="survival">Survival</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="spectator">Spectator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Difficulty */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <Label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-minecraft-green">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peaceful">Peaceful</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Max Players */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <Label className="block text-sm font-medium text-gray-400 mb-2">Max Players</Label>
            <Input 
              type="number" 
              value={maxPlayers} 
              onChange={(e) => setMaxPlayers(e.target.value)}
              min="1" 
              max="100" 
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-minecraft-green"
            />
          </div>
          
          {/* PVP */}
          <div className="bg-minecraft-black p-4 rounded-lg flex items-center justify-between">
            <span className="text-white font-medium">PVP Enabled</span>
            <Switch 
              checked={pvpEnabled}
              onCheckedChange={setPvpEnabled}
              className="bg-gray-700 data-[state=checked]:bg-minecraft-green"
            />
          </div>
          
          {/* Spawn Protection */}
          <div className="bg-minecraft-black p-4 rounded-lg">
            <Label className="block text-sm font-medium text-gray-400 mb-2">Spawn Protection Radius</Label>
            <Slider 
              value={[spawnProtection]} 
              onValueChange={(value) => setSpawnProtection(value[0])}
              max={100} 
              step={1}
              className="w-full h-2 bg-gray-700 rounded-lg accent-minecraft-green"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>{spawnProtection} blocks</span>
              <span>100</span>
            </div>
          </div>
          
          <Button 
            className="w-full py-2 mt-2 bg-minecraft-green text-white rounded font-medium hover:bg-minecraft-darkgreen transition"
            onClick={handleSaveConfig}
            disabled={updateConfigMutation.isPending}
          >
            {updateConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
