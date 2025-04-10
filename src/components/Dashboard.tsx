
import { AlertCircle, HardDrive, Network, Wifi, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { NetworkData } from '@/types/network';

interface DashboardProps {
  data: NetworkData;
}

// Simulated traffic data for chart visualization
const trafficData = Array.from({ length: 12 }, (_, i) => ({
  time: `${i}m`,
  received: Math.floor(Math.random() * 100),
  sent: Math.floor(Math.random() * 60),
}));

export default function Dashboard({ data }: DashboardProps) {
  // Extract interface stats
  const interfaces = Object.entries(data.ethtool || {}).length;
  const activeConnections = (data.connections?.match(/ESTAB/g) || []).length;
  
  // Count different protocols
  const tcpConnections = (data.connections?.match(/tcp/g) || []).length;
  const udpConnections = (data.connections?.match(/udp/g) || []).length;
  
  // Parse interface stats
  const interfaceStats = data.interface_stats || '';
  const totalBytesReceived = interfaceStats
    .split('\n')
    .slice(1)
    .reduce((sum, line) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 1 && parts[0] !== 'lo:') {
        return sum + parseInt(parts[1] || '0');
      }
      return sum;
    }, 0);
  
  const totalBytesSent = interfaceStats
    .split('\n')
    .slice(1)
    .reduce((sum, line) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 8 && parts[0] !== 'lo:') {
        return sum + parseInt(parts[9] || '0');
      }
      return sum;
    }, 0);
  
  // Format bytes to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network Interfaces</p>
                <p className="text-2xl font-bold">{interfaces}</p>
              </div>
              <Network className="h-8 w-8 text-netteal-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">{activeConnections}</p>
              </div>
              <Wifi className="h-8 w-8 text-netblue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">{formatBytes(totalBytesReceived)}</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-netblue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{formatBytes(totalBytesSent)}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-netteal-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="network-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Network Traffic</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trafficData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f6df3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f6df3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#21aab0" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#21aab0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="time" stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a202c', 
                    borderColor: '#2d3748',
                    color: '#e2e8f0'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="received"
                  stroke="#4f6df3"
                  fillOpacity={1}
                  fill="url(#colorReceived)"
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="#21aab0"
                  fillOpacity={1}
                  fill="url(#colorSent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardHeader>
            <CardTitle className="text-lg">Protocol Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">TCP</p>
                  <p className="text-sm font-medium">{tcpConnections}</p>
                </div>
                <div className="h-2 w-full bg-muted rounded">
                  <div 
                    className="h-full bg-netblue-500 rounded"
                    style={{ width: `${Math.min(100, (tcpConnections / (tcpConnections + udpConnections)) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">UDP</p>
                  <p className="text-sm font-medium">{udpConnections}</p>
                </div>
                <div className="h-2 w-full bg-muted rounded">
                  <div 
                    className="h-full bg-netteal-500 rounded"
                    style={{ width: `${Math.min(100, (udpConnections / (tcpConnections + udpConnections)) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col space-y-1.5 pt-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-netteal-400" />
                  <p className="text-sm">System Latency: {data.latency?.ping_gateway?.split('/')[1] || 'N/A'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5 text-netblue-400" />
                  <p className="text-sm">
                    Transfer: {formatBytes(totalBytesReceived)} in / {formatBytes(totalBytesSent)} out
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
