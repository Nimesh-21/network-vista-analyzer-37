
import { DeviceData, StoredDeviceData } from "@/types/network";

const LOCAL_STORAGE_KEY = 'network_vista_devices';

/**
 * Parses JSONL format data into an array of DeviceData objects
 */
export const parseJsonlData = (jsonlData: string): DeviceData[] => {
  try {
    // Split by newlines and parse each line as JSON
    return jsonlData
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line) as DeviceData);
  } catch (error) {
    console.error('Error parsing JSONL data:', error);
    return [];
  }
};

/**
 * Stores device data in localStorage
 */
export const storeDeviceData = (devices: DeviceData[]): void => {
  try {
    const storedData: StoredDeviceData = {
      data: devices,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedData));
  } catch (error) {
    console.error('Error storing device data:', error);
  }
};

/**
 * Retrieves device data from localStorage
 */
export const retrieveDeviceData = (): { devices: DeviceData[], lastUpdated: Date } => {
  try {
    const storedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedDataString) {
      return { devices: [], lastUpdated: new Date() };
    }
    
    const storedData = JSON.parse(storedDataString) as StoredDeviceData;
    return {
      devices: storedData.data,
      lastUpdated: new Date(storedData.lastUpdated),
    };
  } catch (error) {
    console.error('Error retrieving device data:', error);
    return { devices: [], lastUpdated: new Date() };
  }
};

/**
 * Updates device data by merging new data with existing data
 * If a device with the same hostname exists, it will be updated
 * If not, it will be added as a new device
 */
export const updateDeviceData = (newDevicesData: DeviceData[]): DeviceData[] => {
  const { devices: existingDevices } = retrieveDeviceData();
  
  // Create a map of existing devices by hostname for easy lookup
  const deviceMap = new Map<string, DeviceData>();
  existingDevices.forEach(device => {
    deviceMap.set(device.hostname, device);
  });
  
  // Update existing devices or add new ones
  newDevicesData.forEach(newDevice => {
    deviceMap.set(newDevice.hostname, newDevice);
  });
  
  // Convert map back to array
  const updatedDevices = Array.from(deviceMap.values());
  
  // Store the updated devices
  storeDeviceData(updatedDevices);
  
  return updatedDevices;
};

/**
 * Simulates receiving JSONL data from multiple PCs
 * In a real app, this would be replaced with an API call or WebSocket
 */
export const fetchDevicesJsonlData = async (): Promise<DeviceData[]> => {
  try {
    // In a real app, this would be an API call to fetch JSONL data
    // For now, we'll simulate with local sample data
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return sample data (in a real app, parse the JSONL response)
    return updateDeviceData([]);
  } catch (error) {
    console.error('Error fetching device data:', error);
    return [];
  }
};

/**
 * Process incoming JSONL data
 * This would be called when new data is received from PCs
 */
export const processIncomingJsonlData = (jsonlData: string): DeviceData[] => {
  const parsedDevices = parseJsonlData(jsonlData);
  return updateDeviceData(parsedDevices);
};
