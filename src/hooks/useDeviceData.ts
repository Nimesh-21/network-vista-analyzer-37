
import { useState, useEffect, useCallback } from 'react';
import { DeviceData, DevicesState } from '@/types/network';
import { 
  retrieveDeviceData, 
  updateDeviceData, 
  processIncomingJsonlData 
} from '@/services/deviceDataService';
import { useToast } from '@/hooks/use-toast';

// Import sample data - in a real app, this would come from an API
import sampleData from '@/data/sample-data';

export const useDeviceData = () => {
  const { toast } = useToast();
  const [devicesState, setDevicesState] = useState<DevicesState>({
    devices: [],
    selectedDeviceIndex: 0,
    lastUpdated: new Date(),
    isLoading: true,
    error: null
  });

  // Load data from localStorage on initial load
  useEffect(() => {
    const { devices, lastUpdated } = retrieveDeviceData();
    
    if (devices.length > 0) {
      setDevicesState(prev => ({
        ...prev,
        devices,
        lastUpdated,
        isLoading: false
      }));
    } else {
      // If no data in storage, initialize with sample data
      initializeWithSampleData();
    }
  }, []);

  // Initialize with sample data for demo purposes
  const initializeWithSampleData = useCallback(() => {
    try {
      setDevicesState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Convert sample data from new format (object with hostnames as keys)
      // to array format for internal use
      const devicesData: DeviceData[] = Object.values(sampleData);
      
      // Store in localStorage
      updateDeviceData(devicesData);
      
      setDevicesState(prev => ({
        ...prev,
        devices: devicesData,
        lastUpdated: new Date(),
        isLoading: false
      }));
      
    } catch (error) {
      console.error('Error initializing with sample data:', error);
      setDevicesState(prev => ({
        ...prev, 
        isLoading: false, 
        error: 'Failed to initialize data. Please try again.'
      }));
    }
  }, []);

  // Refresh device data
  const refreshDeviceData = useCallback(async () => {
    try {
      setDevicesState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // In a real app, you would fetch data from an API in the new format
      // For demo purposes, we'll just update timestamps and some random values
      const updatedDevices = devicesState.devices.map(device => {
        const clone = { ...device };
        clone.timestamp = new Date().toISOString();
        
        // Update some random values to simulate changes
        if (clone.per_ip_conn_count) {
          const keys = Object.keys(clone.per_ip_conn_count);
          if (keys.length > 0) {
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            clone.per_ip_conn_count[randomKey] = Math.floor(Math.random() * 10) + 1;
          }
        }
        
        return clone;
      });
      
      // Store updated data
      updateDeviceData(updatedDevices);
      
      setDevicesState(prev => ({
        ...prev,
        devices: updatedDevices,
        lastUpdated: new Date(),
        isLoading: false
      }));
      
      toast({
        description: "Network data updated",
        duration: 2000,
      });
      
    } catch (error) {
      console.error('Error refreshing device data:', error);
      setDevicesState(prev => ({
        ...prev, 
        isLoading: false, 
        error: 'Failed to refresh data. Please try again.'
      }));
      
      toast({
        title: "Error updating data",
        description: "Could not refresh network data. Please try again.",
        variant: "destructive",
      });
    }
  }, [devicesState.devices, toast]);

  // Process incoming JSONL data
  const processJsonlData = useCallback((jsonlData: string) => {
    try {
      const updatedDevices = processIncomingJsonlData(jsonlData);
      
      setDevicesState(prev => ({
        ...prev,
        devices: updatedDevices,
        lastUpdated: new Date(),
      }));
      
      toast({
        description: "New network data received",
        duration: 2000,
      });
      
      return true;
    } catch (error) {
      console.error('Error processing JSONL data:', error);
      
      toast({
        title: "Error processing data",
        description: "Could not process the received data. Please check format.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [toast]);

  // Change selected device
  const handleDeviceChange = useCallback((index: number) => {
    setDevicesState(prev => ({
      ...prev,
      selectedDeviceIndex: index
    }));
  }, []);

  // Set up auto-refresh
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshDeviceData();
    }, 60000); // Refresh every 60 seconds (1 minute)
    
    return () => clearInterval(refreshInterval);
  }, [refreshDeviceData]);

  return {
    devicesState,
    refreshDeviceData,
    processJsonlData,
    handleDeviceChange,
  };
};
