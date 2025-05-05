
import { useState } from 'react';
import { NetworkData } from '@/types/network';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeftRight, Calendar, Shield } from 'lucide-react';

interface NetflowVisualizerProps {
  data: NetworkData;
}

export default function NetflowVisualizer({ data }: NetflowVisualizerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const netflowData = data.netflow_last_5min || [];
  
  const filteredFlows = netflowData.filter(flow => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return flow.src4_addr.toLowerCase().includes(term) ||
           flow.dst4_addr.toLowerCase().includes(term) ||
           flow.src_port.toString().includes(term) ||
           flow.dst_port.toString().includes(term);
  });
  
  const totalBytes = netflowData.reduce((sum, flow) => sum + flow.in_bytes, 0);
  const totalPackets = netflowData.reduce((sum, flow) => sum + flow.in_packets, 0);
  
  // Group flows by protocol
  const protocolCounts: Record<number, number> = {};
  netflowData.forEach(flow => {
    protocolCounts[flow.proto] = (protocolCounts[flow.proto] || 0) + 1;
  });
  
  const getProtocolName = (proto: number): string => {
    switch(proto) {
      case 1: return 'ICMP';
      case 6: return 'TCP';
      case 17: return 'UDP';
      default: return `Proto ${proto}`;
    }
  };
  
  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Flows</p>
                <p className="text-2xl font-bold">{netflowData.length}</p>
              </div>
              <ArrowLeftRight className="h-8 w-8 text-netblue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Packets</p>
                <p className="text-2xl font-bold">{totalPackets.toLocaleString()}</p>
              </div>
              <Shield className="h-8 w-8 text-netteal-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bytes</p>
                <p className="text-2xl font-bold">{totalBytes.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-netblue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {netflowData.length > 0 ? (
        <Card className="network-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">NetFlow Data (Last 5 Minutes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by IP or port..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-md border border-border overflow-hidden">
              <div className="grid grid-cols-9 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 bg-muted/50">
                <div className="col-span-1">Protocol</div>
                <div className="col-span-2">Source</div>
                <div className="col-span-2">Destination</div>
                <div className="col-span-1">Packets</div>
                <div className="col-span-1">Bytes</div>
                <div className="col-span-1">Start</div>
                <div className="col-span-1">End</div>
              </div>
              
              <ScrollArea className="h-[400px]">
                {filteredFlows.length > 0 ? (
                  filteredFlows.map((flow, idx) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-9 gap-2 text-sm px-4 py-2 border-t border-border ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                    >
                      <div className="col-span-1 truncate">
                        <span className={flow.proto === 6 ? 'text-netblue-400' : flow.proto === 17 ? 'text-netteal-400' : 'text-muted-foreground'}>
                          {getProtocolName(flow.proto)}
                        </span>
                      </div>
                      <div className="col-span-2 truncate">
                        {flow.src4_addr}:{flow.src_port}
                      </div>
                      <div className="col-span-2 truncate">
                        {flow.dst4_addr}:{flow.dst_port}
                      </div>
                      <div className="col-span-1 truncate">
                        {flow.in_packets}
                      </div>
                      <div className="col-span-1 truncate">
                        {flow.in_bytes.toLocaleString()}
                      </div>
                      <div className="col-span-1 truncate text-xs">
                        {formatTimestamp(flow.first)}
                      </div>
                      <div className="col-span-1 truncate text-xs">
                        {formatTimestamp(flow.last)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    No flows match your search criteria
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="network-card">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center">
              <ArrowLeftRight className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No NetFlow data available</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {netflowData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="network-card">
            <CardHeader>
              <CardTitle className="text-md">Protocol Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(protocolCounts).map(([proto, count]) => (
                  <div key={proto} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {getProtocolName(parseInt(proto))}
                      </p>
                      <p className="text-sm font-medium">
                        {count} flow{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="h-2 w-full bg-muted rounded">
                      <div 
                        className={`h-full rounded ${parseInt(proto) === 6 ? 'bg-netblue-500' : parseInt(proto) === 17 ? 'bg-netteal-500' : 'bg-muted-foreground'}`}
                        style={{ 
                          width: `${(count / netflowData.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="network-card">
            <CardHeader>
              <CardTitle className="text-md">Top Talkers</CardTitle>
            </CardHeader>
            <CardContent>
              {netflowData.length > 0 ? (
                <>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">By Bytes Transferred</h4>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {[...netflowData]
                        .sort((a, b) => b.in_bytes - a.in_bytes)
                        .slice(0, 5)
                        .map((flow, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-muted/20 rounded border border-border/30">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">{flow.src4_addr} → {flow.dst4_addr}</div>
                              <div className="text-sm">{flow.in_bytes.toLocaleString()} bytes</div>
                            </div>
                            <span className={`data-badge ${flow.proto === 6 ? 'bg-netblue-500/10 text-netblue-400 border-netblue-500/20' : 'bg-netteal-500/10 text-netteal-400 border-netteal-500/20'}`}>
                              {getProtocolName(flow.proto)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
