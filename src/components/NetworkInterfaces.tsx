import React from 'react';
import { Wifi, WifiOff, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetworkData } from '@/types/network';

interface NetworkInterfacesProps {
  /**
   * The network data for the selected device, passed from DeviceSelectorDynamic as `data`.
   */
  data: NetworkData;
}

export default function NetworkInterfaces({ data }: NetworkInterfacesProps) {
  const ethtool = data.ethtool ?? {};
  const networkConfig = data.network_config ?? { interfaces: '' };

  // Extract interface names
  const interfaces = networkConfig.interfaces
    .split('\n')
    .filter(line => /^\d+: /.test(line))
    .map(line => (line.match(/^\d+: (.+?):/) || [])[1])
    .filter(Boolean) as string[];

  // Get details for each interface
  const getDetails = (name: string) => {
    const raw = networkConfig.interfaces.split(`${name}:`)[1]?.split(/\d+: /)[0] || '';
    const info: Record<string, string> = {};

    const mac = raw.match(/link\/\w+ ([\w:]+)/)?.[1];
    if (mac) info.mac = mac;

    const ipv4 = raw.match(/inet ([\d.\/]+)/)?.[1];
    if (ipv4) info.ipv4 = ipv4;

    const ipv6 = raw.match(/inet6 ([0-9a-f:\/]+)/)?.[1];
    if (ipv6) info.ipv6 = ipv6;

    const state = raw.match(/state (\w+)/)?.[1];
    if (state) info.state = state;

    const mtu = raw.match(/mtu (\d+)/)?.[1];
    if (mtu) info.mtu = mtu;

    const et = ethtool[name] ?? '';
    const link = et.match(/Link detected: (\w+)/)?.[1];
    if (link) info.link = link;

    const speed = et.match(/Speed: ([^,\n]+)/)?.[1];
    if (speed) info.speed = speed;

    const duplex = et.match(/Duplex: (\w+)/)?.[1];
    if (duplex) info.duplex = duplex;

    return info;
  };

  if (!interfaces.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Interfaces</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8">
            <AlertCircle size={48} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No network interfaces detected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                const details = getDetails(intf);
                const isUp = details.linkDetected === 'yes' || details.state === 'UP';

                return (
                  <TabsContent key={intf} value={intf} className="pt-2">
                    <div className="flex items-center space-x-2 mb-4">
                      {isUp ? <Wifi className="h-5 w-5 text-netteal-400" /> : <WifiOff className="h-5 w-5 text-muted-foreground" />}  
                      <h3 className="text-lg font-medium">{intf} ({isUp ? 'Active' : 'Inactive'})</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
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

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Addressing</h4>
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

                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-muted-foreground">Raw Interface Data</h4>
                      <div className="bg-muted/30 rounded-md p-4 overflow-auto max-h-60">
                        <pre className="text-xs">{
                          networkConfig.interfaces
                            .split('\n')
                            .filter(line => line.includes(`${intf}:`))
                            .join('\n')
                        }</pre>
                      </div>
                    </div>

                    {ethtool[intf] && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-muted-foreground">Device Capabilities (ethtool)</h4>
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
