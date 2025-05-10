import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { ServerStats } from "./lib/eaglercraft";
import { Helmet } from "react-helmet";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import PlayerManagement from "@/pages/PlayerManagement";
import ConfigPage from "@/pages/ConfigPage";
import ConsolePage from "@/pages/ConsolePage";

function TopBar() {
  const { data: serverStats } = useQuery<ServerStats>({
    queryKey: ['/api/server/stats'],
    refetchInterval: 5000,
  });

  return (
    <div className="bg-minecraft-black border-b border-gray-700 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center">
        <button type="button" className="md:hidden text-gray-400 hover:text-white">
          <i className="fas fa-bars"></i>
        </button>
        <h2 className="ml-2 md:ml-0 text-xl font-medium text-white">Dashboard</h2>
      </div>
      <div className="flex items-center">
        <span className="bg-minecraft-green px-3 py-1 rounded-md text-sm font-medium inline-flex items-center">
          <i className="fas fa-circle text-green-300 mr-1 text-xs"></i>
          <span>{serverStats?.players.online || 0}</span> / <span>{serverStats?.players.max || 20}</span> Players
        </span>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        {children}
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/players">
        <Layout>
          <PlayerManagement />
        </Layout>
      </Route>
      <Route path="/config">
        <Layout>
          <ConfigPage />
        </Layout>
      </Route>
      <Route path="/console">
        <Layout>
          <ConsolePage />
        </Layout>
      </Route>
      {/* Fallback to 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <>
      <Helmet>
        <title>Eaglercraft Server Dashboard</title>
        <meta name="description" content="Manage your Eaglercraft Minecraft server through a web browser interface" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Helmet>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
