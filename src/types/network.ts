
export interface NetworkData {
  hostname: string;
  timestamp: string;
  network_config?: {
    interfaces: string;
    routes: string;
    arp_cache: string;
    vlans: string;
    wireless_link: string;
    wireless_stations: string;
  };
  interface_stats?: string;
  ethtool?: Record<string, string>;
  protocol_counters?: {
    snmp: string;
    netstat: string;
  };
  connections?: string;
  per_ip_conn_count?: Record<string, number>;
  listening?: string;
  process_conn_count?: Record<string, number>;
  latency?: {
    ping_8_8_8_8: string;
    ping_gateway: string;
    trace_8_8_8_8: string;
    dns_example_com: string;
  };
  firewall?: {
    iptables: string;
    nftables: string;
    conntrack: string;
  };
  logs?: string;
  namespaces?: Record<string, any>;
  received_at?: string;
}

export type DeviceData = NetworkData;

export interface DevicesState {
  devices: DeviceData[];
  selectedDeviceIndex: number;
  lastUpdated: Date;
  isLoading: boolean;
  error: string | null;
}

// Type for storing data in localStorage
export interface StoredDeviceData {
  data: DeviceData[];
  lastUpdated: string;
}
