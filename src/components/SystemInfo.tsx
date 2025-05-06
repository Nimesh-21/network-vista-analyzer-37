
import { Activity, CpuIcon, Gauge, HardDrive, Network } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkData } from '@/types/network';
import { formatBytes } from '@/services/deviceDataService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SystemInfoProps {
  data: NetworkData;
}

export default function SystemInfo({ data }: SystemInfoProps) {
  // Calculate system metrics
  const hostname = data.hostname;
  const lastUpdated = new Date(data.received_at).toLocaleString();
  
  // Extract port information
  const openPorts = data.open_ports || [];
  
  // Group ports by process
  const portsByProcess = openPorts.reduce((acc: Record<string, {protocol: string, ports: number[]}>, port) => {
    if (!acc[port.process]) {
      acc[port.process] = { protocol: port.protocol, ports: [] };
    }
    acc[port.process].ports.push(port.port);
    return acc;
  }, {});
  
  // Extract ping and latency info
  const pingGateway = data.latency?.ping_gateway || 'N/A';
  const pingGoogle = data.latency?.ping_8_8_8_8 || 'N/A';
  const dnsLookupTime = data.latency?.dns_example_com && data.latency.dns_example_com.match(/Query time: (\d+) msec/);
  const dnsTime = dnsLookupTime ? `${dnsLookupTime[1]} ms` : 'N/A';
  
  // Extract network route information
  const routes = data.network_config?.routes ? data.network_config.routes.split('\n').filter(Boolean) : [];
  const routesWithMarkup = routes.map(route => {
    // Highlight default routes and local networks
    if (route.startsWith('default')) {
      return { text: route, type: 'default' };
    } else if (route.includes('scope link')) {
      return { text: route, type: 'local' };
    }
    return { text: route, type: 'other' };
  });
  
  // Get "raw" ARP cache data
  const arpCache = data.network_config?.arp_cache ? data.network_config.arp_cache.split('\n').filter(Boolean) : [];
  
  // Get protocol counters for detailed inspection
  const snmpData = data.protocol_counters?.snmp || '';
  const netstatData = data.protocol_counters?.netstat || '';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hostname</p>
                <p className="text-lg font-bold truncate">{hostname}</p>
              </div>
              <Network className="h-8 w-8 text-netblue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Ports</p>
                <p className="text-2xl font-bold">{openPorts.length}</p>
              </div>
              <CpuIcon className="h-8 w-8 text-netteal-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gateway Latency</p>
                <p className="text-lg font-bold truncate">{pingGateway}</p>
              </div>
              <Gauge className="h-8 w-8 text-netblue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-lg font-bold truncate">{lastUpdated}</p>
              </div>
              <Activity className="h-8 w-8 text-netteal-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="network-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">System Network Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="routes" className="space-y-4">
              <TabsList>
                <TabsTrigger value="routes">Routing</TabsTrigger>
                <TabsTrigger value="arp">ARP Cache</TabsTrigger>
                <TabsTrigger value="ports">Open Ports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="routes" className="space-y-4">
                <div className="bg-muted/20 rounded-md border border-border p-4">
                  <h3 className="text-sm font-medium mb-2">Network Routes</h3>
                  <ScrollArea className="h-[300px]">
                    {routesWithMarkup.length > 0 ? (
                      <div className="space-y-1 font-mono text-xs">
                        {routesWithMarkup.map((route, idx) => (
                          <div 
                            key={idx} 
                            className={`p-1.5 ${idx % 2 === 0 ? 'bg-muted/20' : ''} ${
                              route.type === 'default' ? 'text-netblue-400 font-medium' : 
                              route.type === 'local' ? 'text-netteal-400' : ''
                            }`}
                          >
                            {route.text}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No routing information available</p>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="arp" className="space-y-4">
                <div className="bg-muted/20 rounded-md border border-border p-4">
                  <h3 className="text-sm font-medium mb-2">ARP Cache</h3>
                  <ScrollArea className="h-[300px]">
                    {arpCache.length > 0 ? (
                      <div className="space-y-1 font-mono text-xs">
                        {arpCache.map((entry, idx) => (
                          <div 
                            key={idx} 
                            className={`p-1.5 ${idx % 2 === 0 ? 'bg-muted/20' : ''} ${
                              entry.includes('REACHABLE') ? 'text-netteal-400' : 
                              entry.includes('STALE') ? 'text-netblue-300' :
                              entry.includes('FAILED') ? 'text-destructive' : ''
                            }`}
                          >
                            {entry}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No ARP cache information available</p>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="ports" className="space-y-4">
                <div className="bg-muted/20 rounded-md border border-border p-4">
                  <h3 className="text-sm font-medium mb-2">Listening Ports by Process</h3>
                  {Object.keys(portsByProcess).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(portsByProcess).map(([process, data], idx) => (
                        <div key={process} className="bg-muted/30 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">{process}</h4>
                            <span className="text-xs bg-netblue-500/20 text-netblue-400 px-2 py-0.5 rounded-full">
                              {data.protocol}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {data.ports.map(port => (
                              <span 
                                key={port} 
                                className="text-xs bg-muted/50 px-2 py-1 rounded"
                              >
                                {port}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No open ports information available</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardHeader>
            <CardTitle className="text-lg">Network Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Latency Metrics</h3>
              <div className="space-y-3">
                <div className="bg-muted/20 p-3 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Gateway Ping</span>
                    <span className="text-sm font-medium">{pingGateway}</span>
                  </div>
                  <div className="data-flow-line">
                    <div className="data-flow-pulse"></div>
                  </div>
                </div>
                
                <div className="bg-muted/20 p-3 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Google DNS Ping</span>
                    <span className="text-sm font-medium">{pingGoogle}</span>
                  </div>
                  <div className="data-flow-line">
                    <div className="data-flow-pulse"></div>
                  </div>
                </div>
                
                <div className="bg-muted/20 p-3 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">DNS Lookup Time</span>
                    <span className="text-sm font-medium">{dnsTime}</span>
                  </div>
                  <div className="data-flow-line">
                    <div className="data-flow-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Interface I/O</h3>
              <div className="space-y-3">
                {data.interface_io && Object.entries(data.interface_io || {}).map(([iface, io]) => (
                  <div key={iface} className="bg-muted/20 p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{iface}</span>
                      <span className="text-xs bg-netblue-500/20 text-netblue-400 px-2 py-0.5 rounded-full">
                        {formatBytes(io.bytes_recv_total + io.bytes_sent_total)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">Received</p>
                        <p>{formatBytes(io.bytes_recv_total)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Sent</p>
                        <p>{formatBytes(io.bytes_sent_total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {data.per_ip_traffic && Object.keys(data.per_ip_traffic || {}).length > 0 && (
        <Card className="network-card">
          <CardHeader>
            <CardTitle className="text-lg">IP Traffic Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Top Traffic by IP</h3>
                <div className="space-y-2">
                  {data.per_ip_traffic && Object.entries(data.per_ip_traffic || {})
                    .sort((a, b) => b[1].bytes - a[1].bytes)
                    .slice(0, 5)
                    .map(([ip, stats]) => (
                      <div key={ip} className="bg-muted/20 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{ip}</span>
                          <span className="text-xs">{stats.bytes.toLocaleString()} bytes</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded overflow-hidden">
                          <div 
                            className="h-full bg-netblue-500"
                            style={{ 
                              width: `${Math.min(100, (stats.bytes / 30000) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Traffic Details</h3>
                <div className="bg-muted/20 rounded-md border border-border p-4">
                  <ScrollArea className="h-[220px]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left pb-2">IP Address</th>
                          <th className="text-right pb-2">Packets</th>
                          <th className="text-right pb-2">Bytes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.per_ip_traffic && Object.entries(data.per_ip_traffic || {}).map(([ip, stats], idx) => (
                          <tr key={ip} className={idx % 2 === 0 ? 'bg-muted/20' : ''}>
                            <td className="py-1.5">{ip}</td>
                            <td className="text-right py-1.5">{stats.packets.toLocaleString()}</td>
                            <td className="text-right py-1.5">{stats.bytes.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
