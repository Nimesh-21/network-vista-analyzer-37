
import { useState, useEffect } from 'react';
import { 
  Activity, Server, Database, Clock, ArrowDownRight, 
  ArrowUpRight, Wifi, CheckCircle2, AlertCircle, Shield, AlertOctagon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeviceData, GlobalStats, Alert } from '@/types/network';
import { calculateGlobalStats } from '@/services/globalStatsService';
import { formatBytes, isDeviceActive } from '@/services/deviceDataService';
import { useAlerts } from '@/hooks/useAlerts';
import { formatAlertTimestamp, getSeverityLevel } from '@/services/alertService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
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
  const { alerts } = useAlerts();
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  
  // Calculate global statistics
  useEffect(() => {
    if (devices.length > 0) {
      const calculatedStats = calculateGlobalStats(devices);
      setStats(calculatedStats);
    }
  }, [devices]);

  // Get recent alerts
  useEffect(() => {
    if (alerts.length > 0) {
      // Get last 3 alerts
      setRecentAlerts(alerts.slice(0, 3));
    }
  }, [alerts]);
  
  // Generate data for traffic history chart
  const prepareNetworkTrafficData = () => {
    // Generate time points for the last 12 hours (simulated data)
    const timePoints = Array.from({ length: 12 }, (_, i) => {
      const hour = new Date().getHours() - (11 - i);
      return {
        time: `${hour >= 0 ? hour : 24 + hour}:00`,
        received: Math.floor(Math.random() * 100 + (i * 5)),
        sent: Math.floor(Math.random() * 60 + (i * 3))
      };
    });
    
    // Calculate total received and sent data
    return timePoints;
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
  
  const prepareIPTrafficData = () => {
    if (!stats?.ipTrafficData) return [];
    
    return Object.entries(stats.ipTrafficData)
      .map(([ip, data]) => ({
        ip,
        connections: data.connections,
      }))
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 5); // Top 5 IPs by connections
  };
  
  const networkTrafficData = prepareNetworkTrafficData();
  const protocolData = prepareProtocolDistributionData();
  const deviceStatusData = prepareDeviceStatusData();
  const ipTrafficData = prepareIPTrafficData();
  
  // Colors for charts
  const COLORS = ['#4f6df3', '#21aab0', '#ea5d2a', '#10b981'];

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="h-10 w-10 text-primary animate-pulse" />
      </div>
    );
  }

  const renderSeverityBadge = (severity: number) => {
    const level = getSeverityLevel(severity);
    
    if (level === 'low') {
      return <Badge variant="outline" className="bg-netteal-500/10 text-netteal-400 border-netteal-500/20">Low</Badge>;
    } else if (level === 'medium') {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Medium</Badge>;
    } else if (level === 'high') {
      return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">High</Badge>;
    } else {
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Critical</Badge>;
    }
  };

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
          <CardHeader>
            <CardTitle className="text-lg">Network Traffic</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={networkTrafficData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="received"
                  name="Received (MB)"
                  stroke="#4f6df3"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="sent"
                  name="Sent (MB)"
                  stroke="#21aab0"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardHeader>
            <CardTitle className="text-lg">Network Summary</CardTitle>
          </CardHeader>
          <CardContent>
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

      {/* Top IP Traffic */}
      <Card className="network-card">
        <CardHeader>
          <CardTitle className="text-lg">Top IP Connections</CardTitle>
        </CardHeader>
        <CardContent>
          {ipTrafficData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {ipTrafficData.map((item, index) => (
                <Card key={item.ip} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{item.ip}</span>
                        <Badge variant="outline" className="bg-netblue-500/10 text-netblue-400 border-netblue-500/20">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Connections:</span>
                        <span>{item.connections}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No IP traffic data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card className="network-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Alerts</CardTitle>
          <Button variant="outline" size="sm" onClick={() => window.location.hash = "#alerts"}>
            View All Alerts
          </Button>
        </CardHeader>
        <CardContent>
          {recentAlerts.length > 0 ? (
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div 
                  key={alert.MESSAGE.eventId} 
                  className={`bg-muted/10 rounded-md border border-border p-4 ${getSeverityLevel(alert.MESSAGE.severity) === 'critical' ? 'alert-critical' : getSeverityLevel(alert.MESSAGE.severity) === 'high' ? 'alert-high' : getSeverityLevel(alert.MESSAGE.severity) === 'medium' ? 'alert-medium' : 'alert-low'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <AlertOctagon className="h-4 w-4 text-destructive" />
                        <h4 className="font-semibold text-sm">{alert.MESSAGE.attackerIp} → {alert.MESSAGE.destinationIp}</h4>
                        {renderSeverityBadge(alert.MESSAGE.severity)}
                      </div>
                      <p className="text-xs text-muted-foreground">{formatAlertTimestamp(alert)}</p>
                      <p className="text-xs mt-2 font-mono break-all bg-background/20 p-1.5 rounded border border-border/50">{alert.MESSAGE.logText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No recent alerts</p>
            </div>
          )}
        </CardContent>
      </Card>
      
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
