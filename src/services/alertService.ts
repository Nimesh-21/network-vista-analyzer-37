
import { Alert } from '@/types/network';
import { toast } from '@/components/ui/use-toast';

// URL for fetching alerts (to be replaced with actual endpoint)
const ALERTS_API_URL = 'https://api.example.com/alerts'; // Replace with actual API endpoint

// Fetch alerts from API
export async function fetchAlerts(): Promise<Alert[]> {
  try {
    // In a real app, we would use fetch to get data from an API
    // For now, we'll simulate with dummy data
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return dummy data
    return generateDummyAlerts(5);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    toast({
      title: "Error Fetching Alerts",
      description: "Could not retrieve alert data. Please try again later.",
      variant: "destructive"
    });
    throw error;
  }
}

// Generate dummy alerts for development
function generateDummyAlerts(count: number): Alert[] {
  const alerts: Alert[] = [];
  
  const eventTypes = [1, 2, 3, 4, 5];
  const eventNames = [10, 20, 30, 36, 40];
  const severities = [1, 5, 8, 10, 11];
  const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP', 'DNS'];
  const ipAddresses = [
    '10.229.40.55', 
    '192.168.1.100', 
    '172.16.254.1', 
    '10.42.0.90', 
    '10.229.40.76'
  ];
  
  for (let i = 0; i < count; i++) {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    // Format each part of the MAC address separately
    const part1 = Math.floor(Math.random() * 100).toString(16).padStart(2, '0');
    const part2 = Math.floor(Math.random() * 100).toString(16).padStart(2, '0');
    const part3 = Math.floor(Math.random() * 100).toString(16).padStart(2, '0');
    const part4 = Math.floor(Math.random() * 100).toString(16).padStart(2, '0');
    const part5 = Math.floor(Math.random() * 100).toString(16).padStart(2, '0');
    
    alerts.push({
      HEADER: {
        sourceId: Math.floor(Math.random() * 20) + 1,
        destId: Math.floor(Math.random() * 10) + 1,
        msgId: Math.floor(Math.random() * 100) + 1
      },
      MESSAGE: {
        eventId: `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`,
        srcId: Math.floor(Math.random() * 20) + 1,
        day: Math.floor(Math.random() * 28) + 1,
        month: Math.floor(Math.random() * 12) + 1,
        year: 2025,
        hour: Math.floor(Math.random() * 24),
        minute: Math.floor(Math.random() * 60),
        second: Math.floor(Math.random() * 60),
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        eventName: eventNames[Math.floor(Math.random() * eventNames.length)],
        severity,
        eventReason: severity > 8 ? "Suspicious Activity" : "NA",
        attackerIp: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        attackerInfo: `Source: ${ipAddresses[Math.floor(Math.random() * ipAddresses.length)]}`,
        protocolType: protocols[Math.floor(Math.random() * protocols.length)],
        port: Math.floor(Math.random() * 65535),
        destinationIp: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        deviceType: Math.floor(Math.random() * 3) + 1,
        deviceMacId: `00:${part1}:${part2}:${part3}:${part4}:${part5}`,
        deviceIp: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        logText: severity > 8 
          ? `attacker_ip:${ipAddresses[Math.floor(Math.random() * ipAddresses.length)]}:scan_type:Clustering:detect_type:Clustering:malicious:1` 
          : `connection_attempt:${protocols[Math.floor(Math.random() * protocols.length)]}:port:${Math.floor(Math.random() * 65535)}`
      }
    });
  }
  
  return alerts;
}

// Get severity level as string
export function getSeverityLevel(severity: number): 'low' | 'medium' | 'high' | 'critical' {
  if (severity <= 3) return 'low';
  if (severity <= 7) return 'medium';
  if (severity <= 9) return 'high';
  return 'critical';
}

// Format alert timestamp as a readable string
export function formatAlertTimestamp(alert: Alert): string {
  const { year, month, day, hour, minute, second } = alert.MESSAGE;
  
  const date = new Date(year, month - 1, day, hour, minute, second);
  
  return date.toLocaleString();
}

// Get event name based on event ID
export function getEventName(eventNameId: number): string {
  const eventNames: Record<number, string> = {
    10: "Connection Attempt",
    20: "Port Scan", 
    30: "Brute Force", 
    36: "Suspicious Activity",
    40: "Data Exfiltration"
  };
  
  return eventNames[eventNameId] || "Unknown Event";
}
