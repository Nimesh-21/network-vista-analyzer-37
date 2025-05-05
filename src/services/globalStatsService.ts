
import { DeviceData, GlobalStats, TcpFlagDistribution, DestinationPortCount } from '@/types/network';
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
    deviceStatusSummary: [],
    ipTrafficData: {},
    topIpsByTraffic: [],
    tcpFlagDistribution: {
      SYN: 0,
      ACK: 0,
      PSH: 0,
      RST: 0,
      FIN: 0,
      URG: 0,
      ECE: 0,
      CWR: 0
    },
    topFlows: [],
    commonDestPorts: []
  };
  
  // Return empty stats if no devices
  if (devices.length === 0) {
    return stats;
  }
  
  // Collect latency values for averaging
  const latencyValues: number[] = [];
  
  // Process each device
  devices.forEach(device => {
    // Ensure device properties exist before accessing them
    const interfaceIO = device.interface_io || {};
    const perIpConnCount = device.per_ip_conn_count || {};
    const perIpTraffic = device.per_ip_traffic || {};
    const netflowData = device.netflow_last_5min || [];
    
    // Determine device status
    const isActive = isDeviceActive(device.received_at);
    
    if (isActive) {
      stats.activeDevices++;
    } else {
      stats.inactiveDevices++;
    }
    
    // Calculate total bytes for this device safely
    const deviceBytesReceived = Object.values(interfaceIO).reduce((sum, io) => sum + io.bytes_recv_total, 0);
    const deviceBytesSent = Object.values(interfaceIO).reduce((sum, io) => sum + io.bytes_sent_total, 0);
    
    // Add device to summary
    stats.deviceStatusSummary.push({
      hostname: device.hostname,
      status: isActive ? 'active' : 'inactive',
      ip: extractDeviceIp(device),
      bytesReceived: deviceBytesReceived,
      bytesSent: deviceBytesSent,
      connections: Object.values(perIpConnCount).reduce((sum, count) => sum + count, 0),
      lastUpdated: device.received_at
    });
    
    // Aggregate bytes received/sent
    stats.totalBytesReceived += deviceBytesReceived;
    stats.totalBytesSent += deviceBytesSent;
    
    // Count connections (approximate from per_ip_conn_count)
    const deviceConnections = Object.values(perIpConnCount || {}).reduce((sum, count) => sum + count, 0);
    stats.totalConnections += deviceConnections;
    
    // Count TCP connections (from connections string - approximate)
    const tcpMatches = (device.connections?.match(/tcp/g) || []).length;
    stats.tcpConnections += tcpMatches;
    
    // Count UDP connections (from connections string - approximate)
    const udpMatches = (device.connections?.match(/udp/g) || []).length;
    stats.udpConnections += udpMatches;
    
    // Count established connections (from connections string - approximate)
    const estabMatches = (device.connections?.match(/ESTAB/g) || []).length;
    stats.establishedConnections += estabMatches;
    
    // Count open ports
    stats.totalPorts += device.open_ports?.length || 0;
    
    // Count interfaces (from ethtool)
    stats.totalInterfaces += Object.keys(device.ethtool || {}).length;
    
    // Extract and collect ping latency for averaging
    if (device.latency?.ping_gateway) {
      const pingMatch = device.latency.ping_gateway.match(/avg\s*=\s*([0-9.]+)/);
      if (pingMatch && pingMatch[1]) {
        latencyValues.push(parseFloat(pingMatch[1]));
      }
    }

    // Process IP-wise traffic data
    if (perIpConnCount) {
      Object.entries(perIpConnCount).forEach(([ip, count]) => {
        if (!stats.ipTrafficData[ip]) {
          stats.ipTrafficData[ip] = {
            connections: 0,
            bytesReceived: 0,
            bytesSent: 0
          };
        }
        stats.ipTrafficData[ip].connections += count;
      });
    }
    
    // Process per_ip_traffic data
    if (perIpTraffic && Object.keys(perIpTraffic).length > 0) {
      // Add IP traffic data to topIpsByTraffic
      Object.entries(perIpTraffic).forEach(([ip, data]) => {
        // Add to ipTrafficData
        if (!stats.ipTrafficData[ip]) {
          stats.ipTrafficData[ip] = {
            connections: 0,
            bytesReceived: data.bytes, // Assuming this is received traffic, adjust as needed
            bytesSent: 0
          };
        } else {
          stats.ipTrafficData[ip].bytesReceived = (stats.ipTrafficData[ip].bytesReceived || 0) + data.bytes;
        }
        
        // Add to topIpsByTraffic
        const existingIP = stats.topIpsByTraffic.find(item => item.ip === ip);
        if (existingIP) {
          existingIP.bytes += data.bytes;
          existingIP.packets += data.packets;
        } else {
          stats.topIpsByTraffic.push({
            ip,
            bytes: data.bytes,
            packets: data.packets
          });
        }
      });
    }
    
    // Process NetFlow data for TCP flags distribution
    if (netflowData && netflowData.length > 0) {
      // Create a map of destination ports and their frequency
      const destPortCountMap: Map<number, { protocol: number; count: number }> = new Map();
      
      netflowData.forEach(flow => {
        // Parse TCP flags from the netflow data
        if (flow.proto === 6 && flow.tcp_flags) { // TCP protocol
          // Different netflow exporters format flags differently
          // Some use space-separated like "SYN ACK", others use characters like "...AP.SF"
          // We'll handle both formats
          
          let flags: string[] = [];
          
          // Handle the character format like "...AP.SF"
          if (flow.tcp_flags.includes('.')) {
            const flagMap: Record<string, string> = {
              'S': 'SYN',
              'A': 'ACK',
              'P': 'PSH',
              'R': 'RST',
              'F': 'FIN',
              'U': 'URG',
              'E': 'ECE',
              'C': 'CWR'
            };
            
            for (let i = 0; i < flow.tcp_flags.length; i++) {
              const char = flow.tcp_flags[i];
              if (char !== '.' && flagMap[char]) {
                flags.push(flagMap[char]);
              }
            }
          } else {
            // Handle space-separated format like "SYN ACK"
            flags = flow.tcp_flags.split(' ');
          }
          
          // Increment the flag counters
          flags.forEach(flag => {
            if (flag === 'SYN') stats.tcpFlagDistribution.SYN++;
            if (flag === 'ACK') stats.tcpFlagDistribution.ACK++;
            if (flag === 'PSH') stats.tcpFlagDistribution.PSH++;
            if (flag === 'RST') stats.tcpFlagDistribution.RST++;
            if (flag === 'FIN') stats.tcpFlagDistribution.FIN++;
            if (flag === 'URG') stats.tcpFlagDistribution.URG++;
            if (flag === 'ECE') stats.tcpFlagDistribution.ECE++;
            if (flag === 'CWR') stats.tcpFlagDistribution.CWR++;
          });
        }
        
        // Track destination ports
        const key = flow.dst_port;
        if (!destPortCountMap.has(key)) {
          destPortCountMap.set(key, { protocol: flow.proto, count: 1 });
        } else {
          const current = destPortCountMap.get(key)!;
          destPortCountMap.set(key, { ...current, count: current.count + 1 });
        }
        
        // Add to top flows
        const first = new Date(flow.first);
        const last = new Date(flow.last);
        const durationSeconds = (last.getTime() - first.getTime()) / 1000;
        
        stats.topFlows.push({
          src: flow.src4_addr,
          dst: flow.dst4_addr,
          srcPort: flow.src_port,
          dstPort: flow.dst_port,
          proto: flow.proto,
          bytes: flow.in_bytes,
          packets: flow.in_packets,
          duration: durationSeconds,
          tcpFlags: flow.tcp_flags
        });
      });
      
      // Convert destination ports map to array and add service names
      stats.commonDestPorts = Array.from(destPortCountMap.entries()).map(([port, data]) => {
        let service = "unknown";
        
        // Simple service name mapping based on common ports
        if (port === 22) service = "SSH";
        else if (port === 80) service = "HTTP";
        else if (port === 443) service = "HTTPS";
        else if (port === 53) service = "DNS";
        else if (port === 21) service = "FTP";
        else if (port === 25) service = "SMTP";
        else if (port === 3389) service = "RDP";
        else if (port === 3306) service = "MySQL";
        else if (port === 5432) service = "PostgreSQL";
        else if (port === 27017) service = "MongoDB";
        
        return {
          port,
          protocol: data.protocol,
          count: data.count,
          service
        };
      });
    }
  });
  
  // Calculate average latency
  if (latencyValues.length > 0) {
    const avgLatency = latencyValues.reduce((sum, val) => sum + val, 0) / latencyValues.length;
    stats.averageLatency = `${avgLatency.toFixed(2)} ms`;
  }
  
  // Sort topIpsByTraffic by bytes (descending)
  stats.topIpsByTraffic.sort((a, b) => b.bytes - a.bytes);
  // Limit to top 10
  stats.topIpsByTraffic = stats.topIpsByTraffic.slice(0, 10);
  
  // Sort topFlows by bytes (descending)
  stats.topFlows.sort((a, b) => b.bytes - a.bytes);
  // Limit to top 10
  stats.topFlows = stats.topFlows.slice(0, 10);
  
  // Sort commonDestPorts by count (descending)
  stats.commonDestPorts.sort((a, b) => b.count - a.count);
  // Limit to top 10
  stats.commonDestPorts = stats.commonDestPorts.slice(0, 10);
  
  return stats;
}
