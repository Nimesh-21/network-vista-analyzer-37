
import { Network, ExternalLink, Server, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkData } from '@/types/network';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

interface ConnectionsProps {
  data: NetworkData;
}

interface ConnectionInfo {
  protocol: string;
  state: string;
  localAddress: string;
  localPort: string;
  remoteAddress: string;
  remotePort: string;
  process: string;
}

export default function Connections({ data }: ConnectionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const parseConnections = (connectionsData: string): ConnectionInfo[] => {
    if (!connectionsData) return [];
    
    return connectionsData
      .split('\n')
      .slice(1) // Skip header
      .filter(Boolean)
      .map(line => {
        const parts = line.trim().split(/\s+/);
        
        // Skip if we don't have enough parts for a connection
        if (parts.length < 6) return null;
        
        let protocol = parts[0];
        let state = parts[1];
        let localFull = '';
        let remoteFull = '';
        let process = '';
        
        // Handle multiple formats
        if (parts.length >= 6) {
          // Find the local and remote address columns - may be different positions
          const localCol = parts.findIndex(p => p.includes(':')) || 4;
          
          localFull = parts[localCol] || '';
          remoteFull = parts[localCol + 1] || '';
          
          // Extract process information if available
          process = parts.slice(localCol + 2).join(' ');
          
          // Clean up process info
          process = process.replace(/users:\(\(|\)\)/g, '').replace(/\"/g, '');
        }
        
        // Split address and port
        const [localAddress, localPort] = localFull.split(':').map(s => s.trim());
        const [remoteAddress, remotePort] = remoteFull.split(':').map(s => s.trim());
        
        return {
          protocol,
          state,
          localAddress: localAddress || '',
          localPort: localPort || '',
          remoteAddress: remoteAddress || '',
          remotePort: remotePort || '',
          process
        };
      })
      .filter(Boolean) as ConnectionInfo[];
  };
  
  const connections = parseConnections(data.connections || '');
  
  // Apply filters
  const filteredConnections = connections.filter(conn => {
    // Apply text search
    const searchRegex = new RegExp(searchTerm, 'i');
    const matchesSearch = 
      searchTerm === '' || 
      searchRegex.test(conn.localAddress) ||
      searchRegex.test(conn.remoteAddress) ||
      searchRegex.test(conn.process) ||
      searchRegex.test(conn.protocol);
    
    // Apply type filter
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'tcp' && conn.protocol === 'tcp') ||
      (filter === 'udp' && conn.protocol === 'udp') ||
      (filter === 'established' && conn.state === 'ESTAB');
    
    return matchesSearch && matchesFilter;
  });
  
  const protocolCounts = connections.reduce((acc, conn) => {
    acc[conn.protocol] = (acc[conn.protocol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const stateCounts = connections.reduce((acc, conn) => {
    acc[conn.state] = (acc[conn.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Connections</p>
                <p className="text-2xl font-bold">{connections.length}</p>
              </div>
              <Network className="h-8 w-8 text-netblue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">TCP Connections</p>
                <p className="text-2xl font-bold">{protocolCounts['tcp'] || 0}</p>
              </div>
              <Server className="h-8 w-8 text-netteal-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">UDP Connections</p>
                <p className="text-2xl font-bold">{protocolCounts['udp'] || 0}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-netblue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Established</p>
                <p className="text-2xl font-bold">{stateCounts['ESTAB'] || 0}</p>
              </div>
              <Filter className="h-8 w-8 text-netteal-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="network-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Active Network Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 space-x-2">
            <Input
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted/30'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('tcp')}
                className={`px-3 py-1.5 text-sm ${filter === 'tcp' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted/30'}`}
              >
                TCP
              </button>
              <button
                onClick={() => setFilter('udp')}
                className={`px-3 py-1.5 text-sm ${filter === 'udp' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted/30'}`}
              >
                UDP
              </button>
              <button
                onClick={() => setFilter('established')}
                className={`px-3 py-1.5 text-sm ${filter === 'established' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted/30'}`}
              >
                Established
              </button>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-md border border-border overflow-hidden">
            <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 bg-muted/50">
              <div>Protocol</div>
              <div>State</div>
              <div className="col-span-2">Local Address</div>
              <div className="col-span-2">Remote Address</div>
              <div>Process</div>
            </div>
            
            <ScrollArea className="h-[400px]">
              {filteredConnections.length > 0 ? (
                filteredConnections.map((conn, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-7 gap-2 text-sm px-4 py-2 border-t border-border ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <div className="truncate">
                      <span className={conn.protocol === 'tcp' ? 'text-netblue-400' : 'text-netteal-400'}>
                        {conn.protocol}
                      </span>
                    </div>
                    <div className="truncate">
                      <span className={conn.state === 'ESTAB' ? 'packet-success' : 'text-muted-foreground'}>
                        {conn.state}
                      </span>
                    </div>
                    <div className="col-span-2 truncate">
                      {conn.localAddress}:{conn.localPort}
                    </div>
                    <div className="col-span-2 truncate">
                      {conn.remoteAddress}:{conn.remotePort}
                    </div>
                    <div className="truncate" title={conn.process}>
                      {conn.process}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No connections match your criteria
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
