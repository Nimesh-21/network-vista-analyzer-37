
import { Cpu, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkData } from '@/types/network';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useMemo } from 'react';

interface ProcessesProps {
  data: NetworkData;
}

export default function Processes({ data }: ProcessesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const processStats = useMemo(() => {
    const stats = [] as { processName: string; connectionCount: number; percentage: number }[];
    
    if (data.process_conn_count) {
      const total = Object.values(data.process_conn_count).reduce((a, b) => a + b, 0);
      
      Object.entries(data.process_conn_count).forEach(([process, count]) => {
        // Extract process name from "name(pid)" format
        const processName = process.replace(/\(\d+\)$/, '');
        
        stats.push({
          processName,
          connectionCount: count,
          percentage: (count / total) * 100
        });
      });
      
      // Sort by connection count, descending
      stats.sort((a, b) => b.connectionCount - a.connectionCount);
    }
    
    return stats;
  }, [data.process_conn_count]);
  
  const filteredProcesses = useMemo(() => {
    if (!searchTerm) return processStats;
    
    const term = searchTerm.toLowerCase();
    return processStats.filter(
      process => process.processName.toLowerCase().includes(term)
    );
  }, [processStats, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Processes</p>
                <p className="text-2xl font-bold">{processStats.length}</p>
              </div>
              <Cpu className="h-8 w-8 text-netblue-500" />
            </div>
          </CardContent>
        </Card>
        
        {processStats.slice(0, 1).map((process, index) => (
          <Card key={index} className="network-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="truncate pr-4">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    Most Active: {process.processName}
                  </p>
                  <p className="text-2xl font-bold">{process.connectionCount} conns</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center text-lg font-bold">
                  {Math.round(process.percentage)}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {processStats.slice(1, 2).map((process, index) => (
          <Card key={index} className="network-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="truncate pr-4">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    Second Most Active: {process.processName}
                  </p>
                  <p className="text-2xl font-bold">{process.connectionCount} conns</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center text-lg font-bold">
                  {Math.round(process.percentage)}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        
      </div>
      
      <Card className="network-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Process Network Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search processes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-md border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 bg-muted/50">
              <div className="col-span-5">Process</div>
              <div className="col-span-2 text-right">Connections</div>
              <div className="col-span-5">Activity</div>
            </div>
            
            <ScrollArea className="h-[400px]">
              {filteredProcesses.length > 0 ? (
                filteredProcesses.map((process, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 gap-2 text-sm px-4 py-3 border-t border-border ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <div className="col-span-5 font-medium truncate">
                      {process.processName}
                    </div>
                    <div className="col-span-2 text-right">
                      {process.connectionCount}
                    </div>
                    <div className="col-span-5">
                      <div className="h-2 w-full bg-muted rounded overflow-hidden">
                        <div 
                          className="h-full bg-netblue-500 rounded-l"
                          style={{ width: `${Math.min(100, process.percentage)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {process.percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No processes match your search
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
