
import { FileText, Search, Filter, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkData } from '@/types/network';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useMemo } from 'react';

interface LogsProps {
  data: NetworkData;
}

interface LogEntry {
  timestamp: string;
  host: string;
  service: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export default function Logs({ data }: LogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const parseLogs = (logsData: string): LogEntry[] => {
    if (!logsData) return [];
    
    return logsData
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const parts = line.split(' ');
        
        if (parts.length < 4) return null;
        
        const timestamp = parts[0] || '';
        const host = parts[1] || '';
        const service = parts[2] || '';
        const message = parts.slice(3).join(' ');
        
        // Determine severity based on message content
        let severity: 'info' | 'warning' | 'error' = 'info';
        if (message.match(/error|fail|denied|invalid/i)) {
          severity = 'error';
        } else if (message.match(/warn|alert|notif|caution/i)) {
          severity = 'warning';
        }
        
        return { timestamp, host, service, message, severity };
      })
      .filter(Boolean) as LogEntry[];
  };
  
  const logs = useMemo(() => parseLogs(data.logs || ''), [data.logs]);
  
  const filteredLogs = useMemo(() => {
    let filtered = logs;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(term) || 
        log.service.toLowerCase().includes(term)
      );
    }
    
    // Apply severity filter
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.severity === filter);
    }
    
    return filtered;
  }, [logs, searchTerm, filter]);
  
  // Count logs by severity
  const severityCounts = useMemo(() => {
    const counts = { info: 0, warning: 0, error: 0 };
    
    logs.forEach(log => {
      counts[log.severity]++;
    });
    
    return counts;
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-netblue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold">{severityCounts.warning}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold">{severityCounts.error}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="network-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted/30'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`px-3 py-1.5 text-sm ${filter === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-card hover:bg-muted/30'}`}
              >
                Errors
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-3 py-1.5 text-sm ${filter === 'warning' ? 'bg-yellow-500 text-white' : 'bg-card hover:bg-muted/30'}`}
              >
                Warnings
              </button>
              <button
                onClick={() => setFilter('info')}
                className={`px-3 py-1.5 text-sm ${filter === 'info' ? 'bg-netblue-500 text-white' : 'bg-card hover:bg-muted/30'}`}
              >
                Info
              </button>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-md border border-border overflow-hidden">
            {filteredLogs.length > 0 ? (
              <ScrollArea className="h-[400px]">
                {filteredLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2 border-t border-border ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="text-sm text-muted-foreground">
                        {log.timestamp}
                      </div>
                      <div className={`data-badge 
                        ${log.severity === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                          log.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                          'bg-netblue-500/10 text-netblue-500 border-netblue-500/20'}`}
                      >
                        {log.service}
                      </div>
                    </div>
                    <div className="text-sm">{log.message}</div>
                  </div>
                ))}
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No logs match your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
