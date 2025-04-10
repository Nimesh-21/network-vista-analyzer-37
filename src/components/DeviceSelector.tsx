
import { ChevronDown, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeviceData } from '@/types/network';

interface DeviceSelectorProps {
  devices: DeviceData[];
  selectedDeviceIndex: number;
  onDeviceChange: (index: number) => void;
  onRefresh: () => void;
  lastUpdated: Date;
}

export default function DeviceSelector({
  devices,
  selectedDeviceIndex,
  onDeviceChange,
  onRefresh,
  lastUpdated,
}: DeviceSelectorProps) {
  return (
    <div className="bg-card border border-border/50 rounded-lg p-3 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative">
          <div className="flex items-center gap-2">
            <select
              className="bg-background border border-border px-3 py-2 rounded-md pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={selectedDeviceIndex}
              onChange={(e) => onDeviceChange(Number(e.target.value))}
            >
              {devices.map((device, index) => (
                <option key={index} value={index}>
                  {device.hostname}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="mr-1">IP:</span>
          <span className="font-mono">
            {getDeviceIp(devices[selectedDeviceIndex])}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 self-end md:self-auto">
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span>Last updated:</span>
          <span>{formatDate(lastUpdated)}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8 px-2"
          onClick={onRefresh}
        >
          <RefreshCcw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
}

// Helper functions
function getDeviceIp(device: DeviceData): string {
  if (!device?.network_config?.interfaces) {
    return 'Unknown';
  }
  
  const lines = device.network_config.interfaces.split('\n');
  // Look for IPv4 addresses (inet) in the interfaces information
  for (const line of lines) {
    if (line.trim().startsWith('inet ') && !line.includes('127.0.0.1')) {
      // Extract the IP address
      const match = line.match(/inet\s+([0-9.]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  
  return 'Unknown';
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
}
