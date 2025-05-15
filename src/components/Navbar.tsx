import { useEffect, useState } from 'react';
import { Activity, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hostname, setHostname] = useState<string>('');
  const [deviceCount, setDeviceCount] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://10.229.40.55:5000/latest`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json() as Record<string, any>;
        const hosts = Object.values(data) as any[];
        setDeviceCount(hosts.length);
        if (hosts.length > 0) {
          // display first hostname
          setHostname(hosts[0].hostname);
        } else {
          setHostname('No Hosts');
        }
      } catch (err) {
        console.error('Failed to fetch hosts for Navbar:', err);
        setHostname('Error');
        setDeviceCount(0);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b border-border/50 bg-card">
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-netteal-400" />
          <span className="text-lg font-semibold">Network Detection and Response</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-netblue-400 animate-pulse-slow" />
          <span className="hidden md:inline text-muted-foreground text-sm">System:</span>
          <span className="font-semibold text-sm truncate max-w-[150px] md:max-w-xs">{hostname}</span>
          {deviceCount > 1 && (
            <span className="text-xs bg-netblue-500/20 text-netblue-400 px-2 py-0.5 rounded-full">
              {deviceCount} devices
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground hidden md:block">
          {currentTime.toLocaleString()}
        </div>
      </div>
    </header>
  );
}
