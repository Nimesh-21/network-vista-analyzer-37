
import { DeviceData } from '@/types/network';

// Local storage keys
const DEVICE_DATA_KEY = 'network_monitor_device_data';
const LAST_UPDATED_KEY = 'network_monitor_last_updated';

// Retrieve device data from localStorage
export function retrieveDeviceData(): { devices: DeviceData[], lastUpdated: Date } {
  try {
    const devicesJSON = localStorage.getItem(DEVICE_DATA_KEY);
    const lastUpdatedString = localStorage.getItem(LAST_UPDATED_KEY);
    
    // If we have the data in localStorage, parse it
    if (devicesJSON) {
      const parsedData = JSON.parse(devicesJSON);
      
      // Check if data is in the new format (object with hostnames as keys)
      // or old format (array of device objects)
      const devices = Array.isArray(parsedData) 
        ? parsedData 
        : Object.values(parsedData);
      
      const lastUpdated = lastUpdatedString ? new Date(lastUpdatedString) : new Date();
      
      return { devices, lastUpdated };
    }
    
    // If no data in localStorage, return empty array
    return { devices: [], lastUpdated: new Date() };
  } catch (error) {
    console.error('Error retrieving device data from localStorage:', error);
    return { devices: [], lastUpdated: new Date() };
  }
}

// Update device data in localStorage
export function updateDeviceData(devices: DeviceData[]): void {
  try {
    // Convert devices array to object with hostname as keys
    const devicesObject: Record<string, DeviceData> = {};
    devices.forEach(device => {
      if (device.hostname) {
        devicesObject[device.hostname] = device;
      }
    });
    
    const now = new Date();
    localStorage.setItem(DEVICE_DATA_KEY, JSON.stringify(devicesObject));
    localStorage.setItem(LAST_UPDATED_KEY, now.toISOString());
  } catch (error) {
    console.error('Error updating device data in localStorage:', error);
  }
}

// Process incoming JSONL data with the new format
export function processIncomingJsonlData(jsonlData: string): DeviceData[] {
  try {
    // Parse the JSONL data - it's now an object with hostnames as keys
    const parsedData = JSON.parse(jsonlData);
    
    // Get existing devices
    const { devices } = retrieveDeviceData();
    
    // Create a map of existing devices for easy lookup
    const deviceMap = new Map<string, DeviceData>();
    devices.forEach(device => {
      deviceMap.set(device.hostname, device);
    });
    
    // Process each device in the new data format
    if (typeof parsedData === 'object' && parsedData !== null) {
      // Handle the new format: { "hostname1": {...}, "hostname2": {...} }
      Object.entries(parsedData).forEach(([hostname, deviceData]) => {
        if (typeof deviceData === 'object' && deviceData !== null) {
          const typedDeviceData = deviceData as DeviceData;
          // Make sure hostname is set
          if (!typedDeviceData.hostname) {
            typedDeviceData.hostname = hostname;
          }
          deviceMap.set(hostname, typedDeviceData);
        }
      });
    }
    
    // Convert map back to array
    const updatedDevices = Array.from(deviceMap.values());
    
    // Update localStorage
    updateDeviceData(updatedDevices);
    
    return updatedDevices;
  } catch (error) {
    console.error('Error processing JSONL data:', error);
    throw error;
  }
}

// Calculate if a device is active based on last updated time
export function isDeviceActive(receivedAt: string): boolean {
  const receivedTime = new Date(receivedAt).getTime();
  const currentTime = new Date().getTime();
  const fifteenMinutesInMs = 15 * 60 * 1000;
  
  return (currentTime - receivedTime) <= fifteenMinutesInMs;
}

// Format bytes to human readable format
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Extract device IP from network configuration
export function extractDeviceIp(device: DeviceData): string {
  if (!device || !device.network_config || !device.network_config.interfaces) {
    return 'Unknown';
  }
  
  const lines = device.network_config.interfaces.split('\n');
  // Look for interfaces with IPv4 addresses that are not loopback (127.0.0.1)
  for (const line of lines) {
    if (line.trim().startsWith('inet ') && !line.includes('127.0.0.1')) {
      // Extract the IP address
      const match = line.match(/inet\s+([0-9.]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  
  return 'Unknown';
}
