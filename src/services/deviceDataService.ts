
import { DeviceData } from '@/types/network';

// Local storage keys
const DEVICE_DATA_KEY = 'network_monitor_device_data';
const LAST_UPDATED_KEY = 'network_monitor_last_updated';

// Retrieve device data from localStorage
export function retrieveDeviceData(): { devices: DeviceData[], lastUpdated: Date } {
  try {
    const devicesJSON = localStorage.getItem(DEVICE_DATA_KEY);
    const lastUpdatedString = localStorage.getItem(LAST_UPDATED_KEY);
    
    const devices = devicesJSON ? JSON.parse(devicesJSON) : [];
    const lastUpdated = lastUpdatedString ? new Date(lastUpdatedString) : new Date();
    
    return { devices, lastUpdated };
  } catch (error) {
    console.error('Error retrieving device data from localStorage:', error);
    return { devices: [], lastUpdated: new Date() };
  }
}

// Update device data in localStorage
export function updateDeviceData(devices: DeviceData[]): void {
  try {
    const now = new Date();
    localStorage.setItem(DEVICE_DATA_KEY, JSON.stringify(devices));
    localStorage.setItem(LAST_UPDATED_KEY, now.toISOString());
  } catch (error) {
    console.error('Error updating device data in localStorage:', error);
  }
}

// Process incoming JSONL data
export function processIncomingJsonlData(jsonlData: string): DeviceData[] {
  try {
    // Parse the JSONL data
    const parsedData = JSON.parse(jsonlData);
    
    // Get existing devices
    const { devices } = retrieveDeviceData();
    
    // Create a map of existing devices for easy lookup
    const deviceMap = new Map<string, DeviceData>();
    devices.forEach(device => {
      deviceMap.set(device.hostname, device);
    });
    
    // Process each device in the new data
    Object.entries(parsedData).forEach(([hostname, deviceData]) => {
      deviceMap.set(hostname, deviceData as DeviceData);
    });
    
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
  if (!device.network_config?.interfaces) {
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
