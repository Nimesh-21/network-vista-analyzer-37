
import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import NetworkInterfaces from '@/components/NetworkInterfaces';
import Connections from '@/components/Connections';
import Processes from '@/components/Processes';
import Logs from '@/components/Logs';
import DeviceSelector from '@/components/DeviceSelector';
import { DeviceData, DevicesState } from '@/types/network';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import sample data - in a real app, this would come from an API
import sampleData from '@/data/sample-data';

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  
  // State for device data and selection
  const [devicesState, setDevicesState] = useState<DevicesState>({
    devices: [],
    selectedDeviceIndex: 0,
    lastUpdated: new Date(),
    isLoading: true,
    error: null
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Simulate loading data from an API with multiple devices
  const fetchDevicesData = useCallback(async () => {
    try {
      setDevicesState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // In a real app, you would fetch data from your API here
      // This simulation creates multiple devices with modified sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate sample data for multiple devices
      const devicesData: DeviceData[] = Array.from({ length: 5 }).map((_, index) => {
        const clone = JSON.parse(JSON.stringify(sampleData));
        
        // Modify the hostname and some data to simulate different devices
        if (index > 0) {
          clone.hostname = `device-${index}-${Math.floor(Math.random() * 1000)}`;
          // Modify some values to make each device unique
          if (clone.per_ip_conn_count) {
            const keys = Object.keys(clone.per_ip_conn_count);
            if (keys.length > 0) {
              const randomKey = keys[Math.floor(Math.random() * keys.length)];
              clone.per_ip_conn_count[randomKey] = Math.floor(Math.random() * 10) + 1;
            }
          }
        }
        
        return clone;
      });
      
      setDevicesState(prev => ({
        ...prev,
        devices: devicesData,
        lastUpdated: new Date(),
        isLoading: false
      }));
      
    } catch (error) {
      console.error('Error fetching device data:', error);
      setDevicesState(prev => ({
        ...prev, 
        isLoading: false, 
        error: 'Failed to fetch device data. Please try again.'
      }));
      
      toast({
        title: "Error loading data",
        description: "Could not fetch network data. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Initial data load
  useEffect(() => {
    fetchDevicesData();
  }, [fetchDevicesData]);

  // Set up auto-refresh every minute
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchDevicesData();
      toast({
        description: "Network data updated",
        duration: 2000,
      });
    }, 60000); // Refresh every 60 seconds (1 minute)
    
    return () => clearInterval(refreshInterval);
  }, [fetchDevicesData, toast]);

  // Handle device selection
  const handleDeviceChange = (index: number) => {
    setDevicesState(prev => ({
      ...prev,
      selectedDeviceIndex: index
    }));
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDevicesData();
    toast({
      description: "Refreshing network data...",
      duration: 2000,
    });
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
              onClick={handleRefresh}
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
      case 'statistics':
      case 'system':
      case 'terminal':
        return (
          <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
            <div className="flex flex-col items-center text-center max-w-md">
              <div className="bg-muted/30 p-6 rounded-full mb-4">
                <Loader2 className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">This feature is being developed and will be available in the next update.</p>
            </div>
          </div>
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
              onRefresh={handleRefresh}
              lastUpdated={devicesState.lastUpdated}
            />
          )}
          {renderComponent()}
        </main>
      </div>
    </div>
  );
}
