
import { DeviceData, GlobalStats } from '@/types/network';
import { formatBytes, extractDeviceIp, isDeviceActive } from '@/services/deviceDataService';

export function calculateGlobalStats(devices: DeviceData[]): GlobalStats {
  // Initialize stats
  const stats: GlobalStats = {
    totalDevices: devices.length,
    activeDevices: 0,
    inactiveDevices: 0,
    totalBytesReceived: 0,
    totalBytesSent: 0,
    totalConnections: 0,
    tcpConnections: 0,
    udpConnections: 0,
    establishedConnections: 0,
    averageLatency: 'N/A',
    totalPorts: 0,
    totalInterfaces: 0,
    deviceStatusSummary: []
  };
  
  // Return empty stats if no devices
  if (devices.length === 0) {
    return stats;
  }
  
  // Collect latency values for averaging
  const latencyValues: number[] = [];
  
  // Process each device
  devices.forEach(device => {
    // Determine device status
    const isActive = isDeviceActive(device.received_at);
    
    if (isActive) {
      stats.activeDevices++;
    } else {
      stats.inactiveDevices++;
    }
    
    // Add device to summary
    stats.deviceStatusSummary.push({
      hostname: device.hostname,
      status: isActive ? 'active' : 'inactive',
      ip: extractDeviceIp(device),
      bytesReceived: Object.values(device.interface_io).reduce((sum, io) => sum + io.bytes_recv_total, 0),
      bytesSent: Object.values(device.interface_io).reduce((sum, io) => sum + io.bytes_sent_total, 0),
      connections: Object.values(device.per_ip_conn_count).reduce((sum, count) => sum + count, 0),
      lastUpdated: device.received_at
    });
    
    // Aggregate bytes received/sent
    stats.totalBytesReceived += Object.values(device.interface_io).reduce((sum, io) => sum + io.bytes_recv_total, 0);
    stats.totalBytesSent += Object.values(device.interface_io).reduce((sum, io) => sum + io.bytes_sent_total, 0);
    
    // Count connections (approximate from per_ip_conn_count)
    const deviceConnections = Object.values(device.per_ip_conn_count).reduce((sum, count) => sum + count, 0);
    stats.totalConnections += deviceConnections;
    
    // Count TCP connections (from connections string - approximate)
    const tcpMatches = (device.connections.match(/tcp/g) || []).length;
    stats.tcpConnections += tcpMatches;
    
    // Count UDP connections (from connections string - approximate)
    const udpMatches = (device.connections.match(/udp/g) || []).length;
    stats.udpConnections += udpMatches;
    
    // Count established connections (from connections string - approximate)
    const estabMatches = (device.connections.match(/ESTAB/g) || []).length;
    stats.establishedConnections += estabMatches;
    
    // Count open ports
    stats.totalPorts += device.open_ports?.length || 0;
    
    // Count interfaces (from ethtool)
    stats.totalInterfaces += Object.keys(device.ethtool).length;
    
    // Extract and collect ping latency for averaging
    if (device.latency?.ping_gateway) {
      const pingMatch = device.latency.ping_gateway.match(/avg\s*=\s*([0-9.]+)/);
      if (pingMatch && pingMatch[1]) {
        latencyValues.push(parseFloat(pingMatch[1]));
      }
    }
  });
  
  // Calculate average latency
  if (latencyValues.length > 0) {
    const avgLatency = latencyValues.reduce((sum, val) => sum + val, 0) / latencyValues.length;
    stats.averageLatency = `${avgLatency.toFixed(2)} ms`;
  }
  
  return stats;
}
