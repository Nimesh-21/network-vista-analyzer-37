
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import NetworkInterfaces from '@/components/NetworkInterfaces';
import Connections from '@/components/Connections';
import Processes from '@/components/Processes';
import Logs from '@/components/Logs';
import DeviceSelector from '@/components/DeviceSelector';
import { useDeviceData } from '@/hooks/useDeviceData';
import { Loader2, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { 
    devicesState, 
    refreshDeviceData, 
    processJsonlData, 
    handleDeviceChange 
  } = useDeviceData();
  
  const [jsonlInput, setJsonlInput] = useState('');
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle JSONL data submission
  const handleJsonlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jsonlInput.trim()) {
      processJsonlData(jsonlInput);
      setJsonlInput('');
    }
  };

  // Get the current selected device
  const selectedDevice = devicesState.devices[devicesState.selectedDeviceIndex];

  // Render appropriate component based on active tab
  const renderComponent = () => {
    if (devicesState.isLoading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading network data...</p>
          </div>
        </div>
      );
    }

    if (devicesState.error) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="flex flex-col items-center text-center max-w-md">
            <div className="bg-destructive/10 p-6 rounded-full mb-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Data Error</h3>
            <p className="text-muted-foreground mb-4">{devicesState.error}</p>
            <button 
              onClick={refreshDeviceData}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!selectedDevice) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="flex flex-col items-center text-center max-w-md">
            <p className="text-muted-foreground">No device selected</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={selectedDevice} />;
      case 'interfaces':
        return <NetworkInterfaces data={selectedDevice} />;
      case 'connections':
        return <Connections data={selectedDevice} />;
      case 'processes':
        return <Processes data={selectedDevice} />;
      case 'logs':
        return <Logs data={selectedDevice} />;
      case 'jsonl-input':
        return (
          <Card className="network-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Submit JSONL Device Data</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJsonlSubmit} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Paste JSONL data below. Each line should contain a complete JSON object for a device.
                    New data will update existing devices with the same hostname or add new devices.
                  </p>
                  <textarea
                    className="w-full h-64 p-3 border border-border rounded-md bg-muted/30 font-mono text-sm"
                    value={jsonlInput}
                    onChange={(e) => setJsonlInput(e.target.value)}
                    placeholder='{"hostname": "device-1", "timestamp": "2025-04-09T06:39:28Z", ...}'
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
                >
                  Process Data
                </button>
              </form>
            </CardContent>
          </Card>
        );
      case 'devices':
        return (
          <Card className="network-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">All Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hostname</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devicesState.devices.map((device, index) => {
                    const ipAddress = device.network_config?.interfaces
                      .split('\n')
                      .filter(line => line.includes('inet ') && !line.includes('127.0.0.1'))
                      .map(line => {
                        const match = line.match(/inet\s+([0-9.]+)/);
                        return match ? match[1] : 'Unknown';
                      })[0] || 'Unknown';
                    
                    const isSelected = index === devicesState.selectedDeviceIndex;
                    
                    return (
                      <TableRow 
                        key={index}
                        className={`cursor-pointer ${isSelected ? 'bg-primary/10' : ''}`}
                        onClick={() => handleDeviceChange(index)}
                      >
                        <TableCell className="font-medium">{device.hostname}</TableCell>
                        <TableCell>
                          {new Date(device.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono">{ipAddress}</TableCell>
                        <TableCell>
                          <span className="text-xs bg-netblue-500/20 text-netblue-400 px-2 py-0.5 rounded-full">
                            Online
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      default:
        return <Dashboard data={selectedDevice} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar 
        hostname={selectedDevice?.hostname || 'Loading...'} 
        toggleSidebar={toggleSidebar}
        deviceCount={devicesState.devices.length}
      />
      
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        
        <main className={`flex-1 transition-all duration-300 p-4 pt-6 ${sidebarOpen ? 'md:ml-60' : 'ml-0'}`}>
          {devicesState.devices.length > 0 && (
            <DeviceSelector
              devices={devicesState.devices}
              selectedDeviceIndex={devicesState.selectedDeviceIndex}
              onDeviceChange={handleDeviceChange}
              onRefresh={refreshDeviceData}
              lastUpdated={devicesState.lastUpdated}
            />
          )}
          {renderComponent()}
        </main>
      </div>
    </div>
  );
}
