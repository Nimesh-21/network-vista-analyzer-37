import { useState } from 'react';
import { 
  Shield, Search, AlertCircle, Filter, 
  Clock, AlertTriangle, Wifi, Cpu, Network 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert } from '@/types/network';
import { formatAlertTimestamp, getEventName, getSeverityLevel } from '@/services/alertService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAlerts } from '@/hooks/useAlerts';
import { mapField } from '@/alertMapping';

export default function Alerts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const { alerts, isLoading, error, refreshAlerts } = useAlerts();
  console.log('Alerts:', alerts);
  

  const getSeverityLevel = (code: number) => mapField('severity', code).toLowerCase();
  // Apply filters
  const filteredAlerts = alerts.filter(alert => {
    // map raw severity
    const level = getSeverityLevel(alert.MESSAGE.severity);

    // Apply severity filter
    if (severityFilter !== 'all' && level !== severityFilter) {
      return false;
    }

    // Apply search term across MESSAGE fields
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      return ['attackerIp','destinationIp','logText','protocolType']
        .some(k => alert.MESSAGE[k].toLowerCase().includes(t));
    }

    return true;
  });

  // Count alerts by severity
  const severityKeys = ['low_risk','medium_risk','high_risk','critical','warning','alert','emergency'];
  const severityCounts = severityKeys.reduce((acc, key) => ({
    ...acc,
    [key]: alerts.filter(a => getSeverityLevel(a.MESSAGE.severity) === key).length,
  }), {} as Record<string, number>);

  const renderSeverityBadge = (code: number) => {
    const level = getSeverityLevel(code);

    switch (level) {
      case 'low_risk':
        return <Badge>Low Risk</Badge>;
      case 'medium_risk':
        return <Badge>Medium Risk</Badge>;
      case 'high_risk':
        return <Badge>High Risk</Badge>;
      case 'critical':
        return <Badge>Critical</Badge>;
      case 'warning':
        return <Badge>Warning</Badge>;
      case 'alert':
        return <Badge variant="destructive">Alert</Badge>;
      case 'emergency':
        return <Badge variant="destructive">Emergency</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center">
        <Shield className="h-12 w-12 animate-pulse text-netblue-400 mb-4" />
        <p className="text-muted-foreground">Loading alert data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="bg-destructive/10 p-6 rounded-full mb-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Error Loading Alerts</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={refreshAlerts}>Try Again</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Shield className="h-8 w-8 text-netblue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold">{severityCounts.critical}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Severity</p>
                <p className="text-2xl font-bold">{severityCounts.high_risk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="network-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium/Low</p>
                <p className="text-2xl font-bold">{severityCounts.medium_risk + severityCounts.low_risk}</p>
              </div>
              <Wifi className="h-8 w-8 text-netteal-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="network-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Security Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts by IP, protocol, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex space-x-2 overflow-auto whitespace-nowrap pb-2 md:pb-0">
              <Button
                size="sm"
                variant={severityFilter === 'all' ? "default" : "outline"}
                onClick={() => setSeverityFilter('all')}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-1" />
                All
              </Button>
              <Button
                size="sm"
                variant={severityFilter === 'critical' ? "destructive" : "outline"}
                onClick={() => setSeverityFilter('critical')}
              >
                Critical
              </Button>
              <Button
                size="sm"
                variant={severityFilter === 'high' ? "default" : "outline"}
                onClick={() => setSeverityFilter('high')}
                className={severityFilter === 'high' ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                High
              </Button>
              <Button
                size="sm"
                variant={severityFilter === 'medium' ? "default" : "outline"}
                onClick={() => setSeverityFilter('medium')}
                className={severityFilter === 'medium' ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                Medium
              </Button>
              <Button
                size="sm"
                variant={severityFilter === 'low' ? "default" : "outline"}
                onClick={() => setSeverityFilter('low')}
                className={severityFilter === 'low' ? "bg-netteal-500 hover:bg-netteal-600" : ""}
              >
                Low
              </Button>
            </div>
          </div>
          
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No alerts match your criteria</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {filteredAlerts.map((alert, idx) => (
                  <div 
                    key={alert.MESSAGE.eventId} 
                    className={`bg-muted/10 rounded-md border border-border p-4 ${getSeverityLevel(alert.MESSAGE.severity) === 'critical' ? 'alert-critical' : getSeverityLevel(alert.MESSAGE.severity) === 'high' ? 'alert-high' : getSeverityLevel(alert.MESSAGE.severity) === 'medium' ? 'alert-medium' : 'alert-low'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{getEventName(alert.MESSAGE.eventName)}</h4>
                          {renderSeverityBadge(alert.MESSAGE.severity)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                          <div>
                            <div className="flex space-x-2 mb-1.5">
                              <Network className="h-4 w-4 text-netblue-400" />
                              <span className="text-muted-foreground">Source:</span>
                              <span className="font-medium">{alert.MESSAGE.attackerIp}</span>
                            </div>
                            <div className="flex space-x-2 mb-1.5">
                              <Cpu className="h-4 w-4 text-netteal-400" />
                              <span className="text-muted-foreground">Destination:</span>
                              <span className="font-medium">{alert.MESSAGE.destinationIp}</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex space-x-2 mb-1.5">
                              <Wifi className="h-4 w-4 text-netblue-400" />
                              <span className="text-muted-foreground">Protocol:</span>
                              <span className="font-medium">{alert.MESSAGE.protocolType}</span>
                              {alert.MESSAGE.port > 0 && (
                                <>
                                  <span className="text-muted-foreground">Port:</span>
                                  <span className="font-medium">{alert.MESSAGE.port}</span>
                                </>
                              )}
                            </div>
                            <div className="flex space-x-2 mb-1.5">
                              <Clock className="h-4 w-4 text-netteal-400" />
                              <span className="text-muted-foreground">Time:</span>
                              <span className="font-medium">{formatAlertTimestamp(alert)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 bg-background/20 p-2 rounded text-sm border border-border/50">
                          <p className="font-mono text-xs break-all">{alert.MESSAGE.logText}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
