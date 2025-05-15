
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import NetworkInterfaces from '@/components/NetworkInterfaces';
import Connections from '@/components/Connections';
import Processes from '@/components/Processes';
import Logs from '@/components/Logs';
import NetflowVisualizer from '@/components/NetflowVisualizer';
import SystemInfo from '@/components/SystemInfo';
import GlobalDashboard from '@/components/GlobalDashboard';
import Alerts from '@/components/Alerts';
import DeviceSelector from '@/components/DeviceSelector';
import NetworkTrafficAnalysis from '@/components/NetworkTrafficAnalysis';
import { useDeviceData } from '@/hooks/useDeviceData';
import { calculateGlobalStats } from '@/services/globalStatsService';
import { Loader2, AlertCircle, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { isDeviceActive } from '@/services/deviceDataService';

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

  // Check URL hash for direct navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'alerts', 'traffic-analysis', 'interfaces', 'connections', 
                'processes', 'logs', 'devices', 'jsonl-input', 'statistics', 'system', 
                'terminal'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Update URL hash when active tab changes
  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // Handle JSONL data submission
  const handleJsonlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jsonlInput.trim()) {
      try {
        const success = processJsonlData(jsonlInput);
        if (success) {
          toast({
            description: "Network data processed successfully",
            duration: 2000,
          });
          setJsonlInput('');
        }
      } catch (error) {
        toast({
          title: "Error processing data",
          description: "Invalid JSONL data format. Please check and try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Get the current selected device
  const selectedDevice = devicesState.devices[devicesState.selectedDeviceIndex];
  
  // Check if the selected device is active
  const isSelectedDeviceActive = selectedDevice ? isDeviceActive(selectedDevice.received_at) : false;
  
  // Calculate global stats for traffic analysis
  const globalStats = devicesState.devices.length > 0 ? calculateGlobalStats(devicesState.devices) : null;

  // Set up auto-refresh every minute
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshDeviceData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [refreshDeviceData]);

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
            <Button 
              onClick={refreshDeviceData}
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    if (!selectedDevice && !['dashboard', 'alerts', 'traffic-analysis', 'devices', 'jsonl-input'].includes(activeTab)) {
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
        return <GlobalDashboard 
          devices={devicesState.devices} 
          onSelectDevice={handleDeviceChange} 
        />;
      case 'alerts':
        return <Alerts />;
      case 'traffic-analysis':
        return <NetworkTrafficAnalysis/>
      case 'interfaces':
        // return <NetworkInterfaces data={selectedDevice} />;
        return selectedDevice ? (
          <NetworkInterfaces 
          data={selectedDevice} 
          key={selectedDevice.hostname /* or selectedDeviceIndex */} 
          />
        ) : (
          <div className="text-center p-8">No device selected</div>
        );
      case 'connections':
        return <Connections data={selectedDevice} />;
      case 'processes':
        return <Processes data={selectedDevice} />;
      case 'logs':
        return <Logs data={selectedDevice} />;
      case 'devices':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devicesState.devices.map((device, idx) => {
                const isActive = isDeviceActive(device.received_at);
                
                return (
                  <Card 
                    key={device.hostname}
                    className={`${idx === devicesState.selectedDeviceIndex ? 'device-card-selected' : 'device-card'}`}
                    onClick={() => handleDeviceChange(idx)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium truncate">{device.hostname}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs ${isActive ? 'status-active' : 'status-inactive'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Last updated: {new Date(device.received_at).toLocaleString()}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Open Ports</p>
                          <p className="text-sm">{device.open_ports?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Connections</p>
                          <p className="text-sm">{Object.values(device.per_ip_conn_count || {}).reduce((a, b) => a + b, 0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      case 'jsonl-input':
        return (
          <Card className="network-card">
            <CardHeader>
              <CardTitle>Submit JSONL Network Data</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJsonlSubmit}>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="jsonl-input" className="text-sm font-medium">
                      Paste JSONL Data
                    </label>
                    <Textarea
                      id="jsonl-input"
                      value={jsonlInput}
                      onChange={(e) => setJsonlInput(e.target.value)}
                      placeholder="Paste your JSONL data here..."
                      className="min-h-[300px] font-mono"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={!jsonlInput.trim()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Process Data
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );
      case 'statistics':
        return <NetflowVisualizer data={selectedDevice} />;
      case 'system':
        return <SystemInfo data={selectedDevice} />;
      case 'terminal':
        return <Dashboard data={selectedDevice} />;
      default:
        return <GlobalDashboard 
          devices={devicesState.devices} 
          onSelectDevice={handleDeviceChange} 
        />;
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-60' : 'ml-0'}`}>
        {/* Navbar */}
        <Navbar 
          // hostname={selectedDevice?.hostname || 'Network Vista'} 
          toggleSidebar={toggleSidebar}
          // deviceCount={devicesState.devices.length}
        />
        
        {/* Content */}
        <div className="p-4">
          {/* Device selector (Show only on device-specific tabs) */}
          {!['dashboard', 'alerts', 'traffic-analysis', 'devices', 'jsonl-input'].includes(activeTab) && (
            <DeviceSelector
            devices={devicesState.devices}
            selectedIndex={devicesState.selectedDeviceIndex}
            lastUpdated={devicesState.lastUpdated}
            onDeviceChange={handleDeviceChange}
            onRefresh={refreshDeviceData}
            isLoading={devicesState.isLoading}
            error={devicesState.error}
          />
          
            )}
            {/* Status indicator for selected device */}
            {!['dashboard', 'alerts', 'traffic-analysis', 'devices', 'jsonl-input'].includes(activeTab) && selectedDevice && (
              <div className={`mb-4 p-2 rounded flex items-center space-x-2 ${isSelectedDeviceActive ? 'bg-netteal-500/10' : 'bg-gray-500/10'}`}>
                <div className={`w-3 h-3 rounded-full ${isSelectedDeviceActive ? 'bg-netteal-500' : 'bg-gray-500'}`}></div>
                <span className="text-sm">
                  {isSelectedDeviceActive ? 'This device is active' : 'This device has been inactive for more than 15 minutes'}
                </span>
              </div>
            )}
          
          
          {/* Main Tab content */}
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}
