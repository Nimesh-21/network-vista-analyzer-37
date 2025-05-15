import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GlobalStats, DeviceData } from '@/types/network';
import { calculateGlobalStats } from '@/services/globalStatsService';
import { formatBytes } from '@/services/deviceDataService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface NetworkTrafficAnalysisProps {
  stats: GlobalStats;
}

const COLORS = ['#4f6df3', '#21aab0', '#ea5d2a', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#a855f7', '#f43f5e'];
const TCP_FLAG_COLORS = {
  SYN: '#4f6df3',
  ACK: '#21aab0',
  FIN: '#ea5d2a',
  RST: '#f43f5e',
  PSH: '#10b981',
  URG: '#f97316',
  ECE: '#8b5cf6',
  CWR: '#ec4899'
};
// Dynamic component using only /latest API
export default function NetworkTrafficAnalysisDynamic() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = async () => {
    try {
      const res = await fetch('http://10.229.40.55:5000/latest');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Object.values(data).map((host: any) => {
        const m = host.network_config.interfaces.match(/inet (\d+\.\d+\.\d+\.\d+)/);
        const ip = m?.[1] ?? '—';
        const bytesReceived = Object.values(host.interface_io).reduce(
          (sum: number, io: any) => sum + (io.delta_recv || 0), 0);
        const bytesSent = Object.values(host.interface_io).reduce(
          (sum: number, io: any) => sum + (io.delta_sent || 0), 0);
        return { ...host, ip, bytesReceived, bytesSent };
      });
      setDevices(list);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (devices.length) {
      setStats(calculateGlobalStats(devices));
    }
  }, [devices]);

  const getProtocolName = (proto: number) => {
    switch (proto) {
      case 1: return 'ICMP';
      case 6: return 'TCP';
      case 17: return 'UDP';
      default: return `Proto ${proto}`;
    }
  };

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec.toFixed(1)}s`;
    const m = Math.floor(sec/60);
    return `${m}m ${Math.round(sec%60)}s`;
  };

  if (loading) return <div className="text-center p-8">Loading…</div>;
  if (error || !stats) return <div className="text-center p-8 text-destructive">Error: {error}</div>;

  const topIpsChartData = stats.topIpsByTraffic.slice(0,10).map(i=>({ name: i.ip, value: i.bytes }));
  const tcpFlagData = Object.entries(stats.tcpFlagDistribution)
    .filter(([,c])=>c>0).map(([n,v])=>({ name: n, value: v }));
    const destPortsData = stats.commonDestPorts.slice(0, 10).map(p => ({ 
      name: p.service === 'unknown' ? `${p.port}` : `${p.service} (${p.port})`,
      value: p.count
    }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top IPs by Traffic Volume */}
        <Card className="network-card">
          <CardHeader>
            <CardTitle className="text-lg">Top 10 IPs by Traffic Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topIpsChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <XAxis type="number" tickFormatter={(value) => formatBytes(value)} />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip
                  formatter={(value) => [formatBytes(Number(value)), "Traffic Volume"]}
                  labelFormatter={(label) => `IP: ${label}`}
                  contentStyle={{ 
                    backgroundColor: '#1a202c', 
                    borderColor: '#2d3748',
                    color: '#e2e8f0'
                  }}
                />
                <Bar dataKey="value" fill="#4f6df3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* TCP Flag Distribution */}
        <Card className="network-card">
          <CardHeader>
            <CardTitle className="text-lg">TCP Flag Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tcpFlagData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {tcpFlagData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={TCP_FLAG_COLORS[entry.name as keyof typeof TCP_FLAG_COLORS] || COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} occurrences`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: '#1a202c', 
                      borderColor: '#2d3748',
                      color: '#e2e8f0'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(stats.tcpFlagDistribution)
                .filter(([_, count]) => count > 0)
                .map(([flag, count]) => (
                  <div key={flag} className="flex items-center p-2 bg-muted/20 rounded border border-border/30">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: TCP_FLAG_COLORS[flag as keyof typeof TCP_FLAG_COLORS] }}
                    ></div>
                    <div>
                      <p className="text-xs font-medium">{flag}</p>
                      <p className="text-xs text-muted-foreground">{count}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Common Destination Ports */}
        <Card className="network-card">
          <CardHeader>
            <CardTitle className="text-lg">Common Destination Ports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={destPortsData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
                >
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value: number) => [`${value} connections`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: '#1a202c', 
                      borderColor: '#2d3748',
                      color: '#e2e8f0'
                    }}
                  />
                  <Bar dataKey="value" fill="#21aab0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Flows (Last 5 minutes) */}
        <Card className="network-card">
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Flows (Last 5 Minutes)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Source → Destination</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Bytes</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topFlows.map((flow, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {flow.src}:{flow.srcPort} → {flow.dst}:{flow.dstPort}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={flow.proto === 6 ? 'bg-blue-500/10' : flow.proto === 17 ? 'bg-green-500/10' : 'bg-gray-500/10'}>
                          {getProtocolName(flow.proto)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatBytes(flow.bytes)}</TableCell>
                      <TableCell>{formatDuration(flow.duration)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            {stats.topFlows.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No flow data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* TCP Flag Sequences / Connection Patterns */}
      <Card className="network-card">
        <CardHeader>
          <CardTitle className="text-lg">TCP Flag Sequences / Connection Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source → Destination</TableHead>
                  <TableHead>TCP Flags</TableHead>
                  <TableHead>Packets</TableHead>
                  <TableHead>Bytes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topFlows
                  .filter(flow => flow.proto === 6 && flow.tcpFlags)
                  .map((flow, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {flow.src}:{flow.srcPort} → {flow.dst}:{flow.dstPort}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {flow.tcpFlags.split(' ').map((flag, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="text-xs"
                              style={{
                                backgroundColor: `${TCP_FLAG_COLORS[flag as keyof typeof TCP_FLAG_COLORS] || '#888'}/10`,
                                borderColor: `${TCP_FLAG_COLORS[flag as keyof typeof TCP_FLAG_COLORS] || '#888'}/20`,
                                color: TCP_FLAG_COLORS[flag as keyof typeof TCP_FLAG_COLORS] || '#888'
                              }}
                            >
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{flow.packets}</TableCell>
                      <TableCell>{formatBytes(flow.bytes)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </ScrollArea>
          {stats.topFlows.filter(flow => flow.proto === 6 && flow.tcpFlags).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No TCP flag sequence data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// export default NetworkTrafficAnalysis;
