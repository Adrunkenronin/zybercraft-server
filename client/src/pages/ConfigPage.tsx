import { Helmet } from 'react-helmet';
import { ServerConfiguration } from '@/components/ServerConfiguration';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorldStats } from '@/components/WorldStats';

export default function ConfigPage() {
  return (
    <>
      <Helmet>
        <title>Server Configuration | Eaglercraft Server</title>
        <meta name="description" content="Configure your Eaglercraft Minecraft server settings including game mode, difficulty, and world options." />
      </Helmet>
      
      <div className="flex-1 overflow-y-auto bg-gray-800 p-4 sm:p-6">
        <h2 className="text-xl md:text-2xl font-minecraft text-white mb-6">SERVER CONFIGURATION</h2>
        
        <Tabs defaultValue="gameplay" className="w-full">
          <TabsList className="bg-minecraft-black mb-6">
            <TabsTrigger value="gameplay" className="data-[state=active]:bg-minecraft-green">Gameplay</TabsTrigger>
            <TabsTrigger value="world" className="data-[state=active]:bg-minecraft-green">World</TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-minecraft-green">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gameplay">
            <ServerConfiguration />
          </TabsContent>
          
          <TabsContent value="world">
            <WorldStats />
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card className="bg-minecraft-darkstone rounded-lg shadow-lg overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-minecraft text-lg text-white mb-4">ADVANCED SETTINGS</h3>
                
                <div className="space-y-4">
                  <p className="text-gray-400">
                    Advanced settings for the Eaglercraft server are not yet implemented in this version of the dashboard.
                  </p>
                  
                  <div className="bg-minecraft-black p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Server Properties</h4>
                    <p className="text-gray-400 text-sm">
                      To modify advanced server properties, edit the server.properties file directly
                      or use the console commands.
                    </p>
                  </div>
                  
                  <div className="bg-minecraft-black p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Connection Settings</h4>
                    <p className="text-gray-400 text-sm">
                      Eaglercraft server is accessible through web browsers using WebSocket connections.
                      Default connection port: 8081 (WebSocket)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
