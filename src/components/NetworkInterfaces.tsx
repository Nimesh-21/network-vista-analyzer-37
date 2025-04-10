
import { Wifi, WifiOff, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkData } from '@/types/network';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NetworkInterfacesProps {
  data: NetworkData;
}

export default function NetworkInterfaces({ data }: NetworkInterfacesProps) {
  const ethtool = data.ethtool || {};
  const networkConfig = data.network_config || { interfaces: '' };
  
  // Parse interfaces from network_config
  const interfaces = networkConfig.interfaces
    .split('\n')
    .filter(line => line.match(/^\d+: /))
    .map(line => {
      const match = line.match(/^\d+: (.+?):/);
      return match ? match[1] : '';
    })
    .filter(Boolean);
  
  // Extract interface details
  const getInterfaceDetails = (interfaceName: string) => {
    const interfaceInfo: Record<string, string> = {};
    
    const interfaceLines = networkConfig.interfaces
      .split(`${interfaceName}:`)
      [1]?.split(/\d+: /)[0];
    
    if (interfaceLines) {
      // Extract the MAC address
      const macMatch = interfaceLines.match(/link\/\w+ ([\w:]+)/);
      if (macMatch) interfaceInfo.mac = macMatch[1];
      
      // Extract IPv4 address
      const ipv4Match = interfaceLines.match(/inet ([\d.\/]+)/);
      if (ipv4Match) interfaceInfo.ipv4 = ipv4Match[1];
      
      // Extract IPv6 address
      const ipv6Match = interfaceLines.match(/inet6 ([a-f0-9:\/]+)/);
      if (ipv6Match) interfaceInfo.ipv6 = ipv6Match[1];
      
      // Extract state
      const stateMatch = interfaceLines.match(/state (\w+)/);
      if (stateMatch) interfaceInfo.state = stateMatch[1];
      
      // Extract MTU
      const mtuMatch = interfaceLines.match(/mtu (\d+)/);
      if (mtuMatch) interfaceInfo.mtu = mtuMatch[1];
    }
    
    // Get link detection from ethtool
    if (ethtool[interfaceName]) {
      const linkMatch = ethtool[interfaceName].match(/Link detected: (\w+)/);
      if (linkMatch) interfaceInfo.linkDetected = linkMatch[1];
      
      const speedMatch = ethtool[interfaceName].match(/Speed: ([^,\n]+)/);
      if (speedMatch) interfaceInfo.speed = speedMatch[1];
      
      const duplexMatch = ethtool[interfaceName].match(/Duplex: (\w+)/);
      if (duplexMatch) interfaceInfo.duplex = duplexMatch[1];
    }
    
    return interfaceInfo;
  };

  return (
    <div className="space-y-6">
      <Card className="network-card">
        <CardHeader>
          <CardTitle className="text-lg">Network Interfaces</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={interfaces[0] || 'none'}>
            <TabsList className="mb-4 flex flex-wrap">
              {interfaces.length > 0 ? (
                interfaces.map(intf => (
                  <TabsTrigger key={intf} value={intf} className="mr-2 mb-2">
                    {intf}
                  </TabsTrigger>
                ))
              ) : (
                <TabsTrigger value="none">No interfaces found</TabsTrigger>
              )}
            </TabsList>
            
            {interfaces.length > 0 ? (
              interfaces.map(intf => {
                const details = getInterfaceDetails(intf);
                const isActive = details.linkDetected === 'yes' || details.state === 'UP';
                
                return (
                  <TabsContent key={intf} value={intf} className="pt-2">
                    <div className="flex items-center space-x-2 mb-4">
                      {isActive ? (
                        <Wifi className="h-5 w-5 text-netteal-400" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-muted-foreground" />
                      )}
                      <h3 className="text-lg font-medium">{intf}</h3>
                      <span className={isActive ? 'interface-active' : 'interface-inactive'}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="stat-card">
                              <span className="stat-label">State</span>
                              <span className="stat-value text-base">{details.state || 'N/A'}</span>
                            </div>
                            <div className="stat-card">
                              <span className="stat-label">Link</span>
                              <span className="stat-value text-base">{details.linkDetected || 'N/A'}</span>
                            </div>
                            <div className="stat-card">
                              <span className="stat-label">Speed</span>
                              <span className="stat-value text-base">{details.speed || 'N/A'}</span>
                            </div>
                            <div className="stat-card">
                              <span className="stat-label">Duplex</span>
                              <span className="stat-value text-base">{details.duplex || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Addressing</h4>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="stat-card">
                              <span className="stat-label">IPv4</span>
                              <span className="stat-value text-base break-all">{details.ipv4 || 'N/A'}</span>
                            </div>
                            <div className="stat-card">
                              <span className="stat-label">IPv6</span>
                              <span className="stat-value text-base break-all">{details.ipv6 || 'N/A'}</span>
                            </div>
                            <div className="stat-card">
                              <span className="stat-label">MAC Address</span>
                              <span className="stat-value text-base">{details.mac || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Interface Details</h4>
                      <div className="bg-muted/30 rounded-md p-4 overflow-auto max-h-60">
                        <pre className="text-xs">
                          {networkConfig.interfaces
                            .split('\n')
                            .filter(line => line.includes(`${intf}:`))
                            .join('\n')}
                        </pre>
                      </div>
                    </div>
                    
                    {ethtool[intf] && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Device Capabilities</h4>
                        <div className="bg-muted/30 rounded-md p-4 overflow-auto max-h-60">
                          <pre className="text-xs">{ethtool[intf]}</pre>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                );
              })
            ) : (
              <TabsContent value="none">
                <div className="flex flex-col items-center justify-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No network interfaces detected</p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
