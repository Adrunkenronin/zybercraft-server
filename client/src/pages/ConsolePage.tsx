import { Helmet } from 'react-helmet';
import { ServerConsole } from '@/components/ServerConsole';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConsolePage() {
  const { toast } = useToast();
  
  const handleDownloadLogs = () => {
    toast({
      title: 'Download Logs',
      description: 'Log download function not implemented yet.',
    });
  };
  
  const handleClearLogs = () => {
    toast({
      title: 'Clear Logs',
      description: 'Log clearing function not implemented yet.',
    });
  };
  
  return (
    <>
      <Helmet>
        <title>Server Console | Eaglercraft Server</title>
        <meta name="description" content="Access your Eaglercraft Minecraft server console. Execute commands and view server logs in real-time." />
      </Helmet>
      
      <div className="flex-1 overflow-y-auto bg-gray-800 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl md:text-2xl font-minecraft text-white mb-2 md:mb-0">SERVER CONSOLE</h2>
          
          <div className="flex space-x-2">
            <Button 
              className="bg-gray-700 text-white rounded font-medium hover:bg-gray-600 transition flex items-center"
              onClick={handleDownloadLogs}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download Logs
            </Button>
            <Button 
              className="bg-red-600 text-white rounded font-medium hover:bg-red-700 transition flex items-center"
              onClick={handleClearLogs}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Logs
            </Button>
          </div>
        </div>
        
        <Card className="bg-minecraft-darkstone rounded-lg shadow-lg overflow-hidden mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="bg-minecraft-black p-4 rounded-lg mb-4">
              <h3 className="text-white font-medium mb-2">Console Help</h3>
              <p className="text-gray-400 text-sm mb-2">
                Use the console to execute commands and view server logs in real-time.
              </p>
              <ul className="text-gray-400 text-sm list-disc ml-5 space-y-1">
                <li>Type <span className="text-green-400">help</span> to see a list of available commands</li>
                <li>Use <span className="text-green-400">op &lt;player&gt;</span> to give a player operator privileges</li>
                <li>Use <span className="text-green-400">gamemode &lt;mode&gt; [player]</span> to change game modes</li>
                <li>Use <span className="text-green-400">stop</span> to safely stop the server</li>
              </ul>
            </div>
            
            <ServerConsole />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
