
export interface NetworkData {
  hostname: string;
  timestamp: string;
  network_config: {
    interfaces: string;
    routes: string;
    arp_cache: string;
    vlans: string;
    wireless_link: string;
    wireless_stations: string;
  };
  interface_stats_raw?: string;
  interface_stats?: string;
  ethtool: Record<string, string>;
  protocol_counters: {
    snmp: string;
    netstat: string;
  };
  connections: string;
  per_ip_conn_count: Record<string, number>;
  listening: string;
  process_conn_count: Record<string, number>;
  latency: {
    ping_8_8_8_8: string;
    ping_gateway: string;
    trace_8_8_8_8: string;
    dns_example_com: string;
  };
  namespaces?: Record<string, any>;
  open_ports: Array<{
    port: number;
    protocol: string;
    process: string;
  }>;
  interface_io: Record<string, {
    bytes_sent_total: number;
    bytes_recv_total: number;
    packets_sent: number;
    packets_recv: number;
    errin: number;
    errout: number;
    delta_sent: number;
    delta_recv: number;
  }>;
  per_ip_traffic?: Record<string, {
    bytes: number;
    packets: number;
  }>;
  netflow_last_5min?: Array<{
    type: string;
    sampled: number;
    export_sysid: number;
    first: string;
    last: string;
    received: string;
    in_packets: number;
    in_bytes: number;
    proto: number;
    tcp_flags: string;
    src_port: number;
    dst_port: number;
    src_tos: number;
    src4_addr: string;
    dst4_addr: string;
    src_geo: string;
    dst_geo: string;
    input_snmp: number;
    output_snmp: number;
    src_mask: number;
    dst_mask: number;
    src_net: string;
    dst_net: string;
    fwd_status: number;
    direction: number;
    dst_tos: number;
    ip4_router: string;
    label: string;
  }>;
  logs?: string;
  firewall?: {
    iptables: string;
    nftables: string;
    conntrack: string;
  };
  received_at: string;
}

export interface DeviceData extends NetworkData {}

export interface DevicesState {
  devices: DeviceData[];
  selectedDeviceIndex: number;
  lastUpdated: Date;
  isLoading: boolean;
  error: string | null;
}

export interface Alert {
  HEADER: {
    sourceId: number;
    destId: number;
    msgId: number;
  };
  MESSAGE: {
    eventId: string;
    srcId: number;
    day: number;
    month: number;
    year: number;
    hour: number;
    minute: number;
    second: number;
    eventType: number;
    eventName: number;
    severity: number;
    eventReason: string;
    attackerIp: string;
    attackerInfo: string;
    protocolType: string;
    port: number;
    destinationIp: string;
    deviceType: number;
    deviceMacId: string;
    deviceIp: string;
    logText: string;
  };
}

export interface GlobalStats {
  totalDevices: number;
  activeDevices: number;
  inactiveDevices: number;
  totalBytesReceived: number;
  totalBytesSent: number;
  totalConnections: number;
  tcpConnections: number;
  udpConnections: number;
  establishedConnections: number;
  averageLatency: string;
  totalPorts: number;
  totalInterfaces: number;
  deviceStatusSummary: {
    hostname: string;
    status: 'active' | 'inactive';
    ip: string;
    bytesReceived: number;
    bytesSent: number;
    connections: number;
    lastUpdated: string;
  }[];
}
