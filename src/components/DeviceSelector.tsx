import React from 'react';
import { ChevronDown, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeviceData } from '@/types/network';

interface DeviceSelectorProps {
  devices: DeviceData[];
  selectedIndex: number;
  lastUpdated: Date;
  onDeviceChange: (index: number) => void;
  onRefresh: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function DeviceSelector({
  devices,
  selectedIndex,
  lastUpdated,
  onDeviceChange,
  onRefresh,
  isLoading,
  error,
}: DeviceSelectorProps) {
  function getDeviceIp(device?: DeviceData): string {
    const interfaces = device?.network_config?.interfaces;
    if (!interfaces) return 'Unknown';
    const lines = interfaces.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('inet ') && !line.includes('127.0.0.1')) {
        const match = line.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
        if (match) return match[1];
      }
    }
    return 'Unknown';
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(date);
  }

  if (isLoading) return <div className="text-center p-4">Loading devices…</div>;
  if (error) return <div className="text-center p-4 text-destructive">Error: {error}</div>;
  if (!devices.length) return <div className="text-center p-4">No devices found</div>;

  return (
    <div className="bg-card border border-border/50 rounded-lg p-3 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative">
          <div className="flex items-center gap-2">
            <select
              className="bg-background border border-border px-3 py-2 rounded-md pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={selectedIndex}
              onChange={e => onDeviceChange(Number(e.target.value))}
            >
              {devices.map((device, idx) => (
                <option key={idx} value={idx}>
                  {device.hostname}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="mr-1">IP:</span>
          <span className="font-mono">{getDeviceIp(devices[selectedIndex])}</span>
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
