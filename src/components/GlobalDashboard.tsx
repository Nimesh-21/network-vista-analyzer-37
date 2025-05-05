import { useState, useEffect } from 'react';
import { 
  Activity, Server, Database, Clock, ArrowDownRight, 
  ArrowUpRight, Wifi, CheckCircle2, AlertCircle, Shield 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DeviceData, GlobalStats } from '@/types/network';
import { calculateGlobalStats } from '@/services/globalStatsService';
import { formatBytes, isDeviceActive } from '@/services/deviceDataService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface GlobalDashboardProps {
  devices: DeviceData[];
  onSelectDevice: (index: number) => void;
}

export default function GlobalDashboard({ devices, onSelectDevice }: GlobalDashboardProps) {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  
  // Calculate global statistics
  useEffect(() => {
    if (devices.length > 0) {
      const calculatedStats = calculateGlobalStats(devices);
      setStats(calculatedStats);
    }
  }, [devices]);
  
  // Prepare data for charts
  const prepareNetworkTrafficData = () => {
    if (!devices.length) return [];
    
    return devices.map(device => {
      const interfaceIO = device.interface_io || {};
      
      return {
        name: device.hostname.split('-')[0], // First part of hostname for brevity
        received: Object.values(interfaceIO).reduce((sum, io) => sum + io.bytes_recv_total, 0) / (1024 * 1024), // MB
        sent: Object.values(interfaceIO).reduce((sum, io) => sum + io.bytes_sent_total, 0) / (1024 * 1024) // MB
      };
    });
  };
  
  const prepareProtocolDistributionData = () => {
    if (!stats) return [];
    
    return [
      { name: 'TCP', value: stats.tcpConnections },
      { name: 'UDP', value: stats.udpConnections },
    ];
  };
  
  const prepareDeviceStatusData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Active', value: stats.activeDevices },
      { name: 'Inactive', value: stats.inactiveDevices },
    ];
  };
  
  const networkTrafficData = prepareNetworkTrafficData();
  const protocolData = prepareProtocolDistributionData();
  const deviceStatusData = prepareDeviceStatusData();
  
  // Colors for charts
  const COLORS = ['#4f6df3', '#21aab0', '#ea5d2a', '#10b981'];

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="h-10 w-10 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monitored Devices</p>
                <p className="text-2xl font-bold">{stats.totalDevices}</p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground space-x-2">
                  <span className="flex items-center">
                    <CheckCircle2 className="h-3 w-3 text-netteal-400 mr-1" />
                    {stats.activeDevices} active
                  </span>
                  <span className="flex items-center">
                    <AlertCircle className="h-3 w-3 text-muted-foreground mr-1" />
                    {stats.inactiveDevices} inactive
                  </span>
                </div>
              </div>
              <Server className="h-8 w-8 text-netblue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Connections</p>
                <p className="text-2xl font-bold">{stats.totalConnections}</p>
                <div className="flex items-center mt-2 text-xs text-muted-foreground space-x-2">
                  <span className="flex items-center">
                    <Wifi className="h-3 w-3 text-netblue-400 mr-1" />
                    {stats.establishedConnections} established
                  </span>
                </div>
              </div>
              <Database className="h-8 w-8 text-netteal-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">{formatBytes(stats.totalBytesReceived)}</p>
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
                <p className="text-2xl font-bold">{formatBytes(stats.totalBytesSent)}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-netteal-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="network-card lg:col-span-2">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Network Traffic by Device</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={networkTrafficData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#718096" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#718096" />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} MB`, undefined]}
                    contentStyle={{ 
                      backgroundColor: '#1a202c', 
                      borderColor: '#2d3748',
                      color: '#e2e8f0'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="received" name="Received (MB)" fill="#4f6df3" />
                  <Bar dataKey="sent" name="Sent (MB)" fill="#21aab0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Network Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[150px] mt-2">
                <p className="text-sm text-muted-foreground text-center mb-2">Protocol Distribution</p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={protocolData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {protocolData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}`, 'Connections']}
                      contentStyle={{ 
                        backgroundColor: '#1a202c', 
                        borderColor: '#2d3748',
                        color: '#e2e8f0'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-[150px] mt-2">
                <p className="text-sm text-muted-foreground text-center mb-2">Device Status</p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {deviceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Active' ? '#21aab0' : '#718096'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}`, 'Devices']}
                      contentStyle={{ 
                        backgroundColor: '#1a202c', 
                        borderColor: '#2d3748',
                        color: '#e2e8f0'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">System Latency (avg):</span>
                <span className="text-sm font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-netblue-400" />
                  {stats.averageLatency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Open Ports:</span>
                <span className="text-sm font-medium">{stats.totalPorts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Network Interfaces:</span>
                <span className="text-sm font-medium">{stats.totalInterfaces}</span>
              </div>
              <div className="data-flow-line mt-4">
                <div className="data-flow-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Device Status Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Device Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stats.deviceStatusSummary.map((device, index) => (
            <div 
              key={device.hostname}
              className="device-card"
              onClick={() => onSelectDevice(index)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium truncate">{device.hostname.split('-')[0]}</h4>
                    <div className={`w-2 h-2 rounded-full ${device.status === 'active' ? 'bg-netteal-500' : 'bg-gray-500'}`}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">IP: {device.ip}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Received</p>
                      <p className="text-sm">{formatBytes(device.bytesReceived)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sent</p>
                      <p className="text-sm">{formatBytes(device.bytesSent)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-muted-foreground">Connections: {device.connections}</span>
                    <span className="text-muted-foreground">{new Date(device.lastUpdated).toLocaleTimeString()}</span>
                  </div>
                </div>
                <Shield className={`h-6 w-6 ${device.status === 'active' ? 'text-netteal-400' : 'text-gray-500'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
