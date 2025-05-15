import { useState, useEffect, useCallback } from 'react';
import { DeviceData, DevicesState } from '@/types/network';
import { 
  retrieveDeviceData, 
  updateDeviceData, 
  processIncomingJsonlData 
} from '@/services/deviceDataService';
import { useToast } from '@/hooks/use-toast';

export const useDeviceData = () => {
  const { toast } = useToast();
  const [devicesState, setDevicesState] = useState<DevicesState>({
    devices: [],
    selectedDeviceIndex: 0,
    lastUpdated: new Date(),
    isLoading: true,
    error: null
  });

  // Fetch from API (and persist in localStorage) on mount
  const loadFromApi = useCallback(async () => {
    try {
      setDevicesState(prev => ({ ...prev, isLoading: true, error: null }));
      const res = await fetch('http://10.229.40.55:5000/latest');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as Record<string, DeviceData>;
      const list = Object.values(data);
      
      updateDeviceData(list);
      setDevicesState(prev => ({
        ...prev,
        devices: list,
        lastUpdated: new Date(),
        isLoading: false
      }));
    } catch (err: any) {
      console.error('Error fetching device data:', err);
      const { devices, lastUpdated } = retrieveDeviceData();
      setDevicesState(prev => ({
        ...prev,
        devices,
        lastUpdated,
        isLoading: false,
        error: err.message
      }));
      toast({
        title: 'Failed to load devices',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  // On component mount, hit API
  useEffect(() => {
    loadFromApi();
  }, [loadFromApi]);

  // Refresh device data
  const refreshDeviceData = useCallback(async () => {
    await loadFromApi();
    toast({
      description: "Network data updated",
      duration: 2000,
    });
  }, [loadFromApi, toast]);

  // Process incoming JSONL data
  const processJsonlData = useCallback((jsonlData: string) => {
    try {
      const updatedDevices = processIncomingJsonlData(jsonlData);
      updateDeviceData(updatedDevices);
      setDevicesState(prev => ({
        ...prev,
        devices: updatedDevices,
        lastUpdated: new Date(),
      }));
      toast({ description: "New network data received", duration: 2000 });
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
    setDevicesState(prev => ({ ...prev, selectedDeviceIndex: index }));
  }, []);

  // Auto‐refresh every minute
  useEffect(() => {
    const id = setInterval(refreshDeviceData, 60_000);
    return () => clearInterval(id);
  }, [refreshDeviceData]);

  return {
    devicesState,
    refreshDeviceData,
    processJsonlData,
    handleDeviceChange,
  };
};
