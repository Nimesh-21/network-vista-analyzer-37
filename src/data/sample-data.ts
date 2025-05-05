
// This is a sample device data for development and testing
// In a real application, this would come from an API

const sampleData = {
  hostname: "sample-device-1",
  timestamp: "2025-05-01T12:00:00Z",
  network_config: {
    interfaces: "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n    inet 127.0.0.1/8 scope host lo\n       valid_lft forever preferred_lft forever\n    inet6 ::1/128 scope host \n       valid_lft forever preferred_lft forever\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\n    link/ether 00:15:5d:01:9a:01 brd ff:ff:ff:ff:ff:ff\n    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic eth0\n       valid_lft 85576sec preferred_lft 85576sec\n    inet6 fe80::215:5dff:fe01:9a01/64 scope link \n       valid_lft forever preferred_lft forever",
    routes: "default via 192.168.1.1 dev eth0 proto dhcp metric 100 \n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100",
    arp_cache: "192.168.1.1 dev eth0 lladdr 00:15:5d:01:9a:00 REACHABLE",
    vlans: "",
    wireless_link: "",
    wireless_stations: ""
  },
  interface_stats_raw: "Inter-|   Receive                                                |  Transmit\n face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed\n    lo: 1000000  10000    0    0    0     0          0         0 1000000  10000    0    0    0     0       0          0\n  eth0: 5000000  50000    0    0    0     0          0         0 2000000  20000    0    0    0     0       0          0",
  interface_stats: "Inter-|   Receive                                                |  Transmit\n face |bytes    packets errs drop fifo frame compressed multicast|bytes    packets errs drop fifo colls carrier compressed\n    lo: 1000000  10000    0    0    0     0          0         0 1000000  10000    0    0    0     0       0          0\n  eth0: 5000000  50000    0    0    0     0          0         0 2000000  20000    0    0    0     0       0          0",
  ethtool: {
    "eth0": "Settings for eth0:\n\tSupported ports: [ TP ]\n\tSupported link modes:   10baseT/Half 10baseT/Full \n\t                        100baseT/Half 100baseT/Full \n\t                        1000baseT/Full \n\tSupported pause frame use: No\n\tSupports auto-negotiation: Yes\n\tAdvertised link modes:  10baseT/Half 10baseT/Full \n\t                        100baseT/Half 100baseT/Full \n\t                        1000baseT/Full \n\tAdvertised pause frame use: No\n\tAdvertised auto-negotiation: Yes\n\tSpeed: 1000Mb/s\n\tDuplex: Full\n\tPort: Twisted Pair\n\tPHYAD: 0\n\tTransceiver: internal\n\tAuto-negotiation: on\n\tMDI-X: on (auto)\n\tLink detected: yes"
  },
  protocol_counters: {
    snmp: "Ip: Forwarding DefaultTTL InReceives InHdrErrors InAddrErrors ForwDatagrams InUnknownProtos InDiscards InDelivers OutRequests OutDiscards OutNoRoutes ReasmTimeout ReasmReqds ReasmOKs ReasmFails FragOKs FragFails FragCreates\nIp: 2 64 123456 0 0 0 0 0 123456 123456 0 0 0 0 0 0 0 0 0\nIcmp: InMsgs InErrors InDestUnreachs InTimeExcds InParmProbs InSrcQuenchs InRedirects InEchos InEchoReps InTimestamps InTimestampReps InAddrMasks InAddrMaskReps OutMsgs OutErrors OutDestUnreachs OutTimeExcds OutParmProbs OutSrcQuenchs OutRedirects OutEchos OutEchoReps OutTimestamps OutTimestampReps OutAddrMasks OutAddrMaskReps\nIcmp: 100 0 50 0 0 0 0 25 25 0 0 0 0 100 0 50 0 0 0 0 25 25 0 0 0 0\nTcp: RtoAlgorithm RtoMin RtoMax MaxConn ActiveOpens PassiveOpens AttemptFails EstabResets CurrEstab InSegs OutSegs RetransSegs InErrs OutRsts\nTcp: 1 200 120000 -1 1000 500 10 5 50 10000 10000 100 0 10\nUdp: InDatagrams NoPorts InErrors OutDatagrams RcvbufErrors SndbufErrors\nUdp: 5000 100 0 5000 0 0",
    netstat: "TcpExt: SyncookiesSent SyncookiesRecv SyncookiesFailed EmbryonicRsts PruneCalled RcvPruned OfoPruned OutOfWindowIcmps LockDroppedIcmps ArpFilter TW TWRecycled TWKilled PAWSActive PAWSEstab DelayedACKs DelayedACKLocked DelayedACKLost ListenOverflows ListenDrops TCPHPHits TCPPureAcks TCPHPAcks\nTcpExt: 0 0 0 0 0 0 0 0 0 0 100 0 0 0 50 1000 0 10 0 0 1000 5000 5000"
  },
  connections: "Netid  State      Recv-Q Send-Q     Local Address:Port       Peer Address:Port     Process \nudp    UNCONN     0      0          127.0.0.1:323           0.0.0.0:*                \nudp    UNCONN     0      0      0.0.0.0:41613          0.0.0.0:*                \ntcp    LISTEN     0      128        0.0.0.0:22            0.0.0.0:*                \ntcp    ESTAB      0      0          192.168.1.100:49328    142.250.72.174:443       \ntcp    ESTAB      0      0          192.168.1.100:49330    142.250.72.174:443       \ntcp    ESTAB      0      0          192.168.1.100:49332    142.250.72.174:443       \ntcp    ESTAB      0      0          192.168.1.100:49334    142.250.72.174:443",
  per_ip_conn_count: {
    "142.250.72.174": 4,
    "127.0.0.1": 1
  },
  listening: "Netid  State      Recv-Q Send-Q     Local Address:Port       Peer Address:Port     Process \nudp    UNCONN     0      0          127.0.0.1:323           0.0.0.0:*                \nudp    UNCONN     0      0      0.0.0.0:41613          0.0.0.0:*                \ntcp    LISTEN     0      128        0.0.0.0:22            0.0.0.0:*",
  process_conn_count: {
    "sshd(123)": 1,
    "chrome(456)": 4
  },
  latency: {
    ping_8_8_8_8: "rtt min/avg/max/mdev = 10.123/15.234/20.345/2.456 ms",
    ping_gateway: "rtt min/avg/max/mdev = 1.234/2.345/3.456/0.123 ms",
    trace_8_8_8_8: "1  192.168.1.1  1.234 ms  1.345 ms  1.456 ms\n 2  ISP-router.example.com  10.123 ms  10.234 ms  10.345 ms\n 3  core-router.example.com  15.123 ms  15.234 ms  15.345 ms\n 4  8.8.8.8  20.123 ms  20.234 ms  20.345 ms",
    dns_example_com: ";; Query time: 30 msec\n;; SERVER: 8.8.8.8#53(8.8.8.8)\n;; WHEN: Thu Apr 17 12:00:00 EDT 2023\n;; MSG SIZE  rcvd: 56"
  },
  logs: "May  1 12:00:01 sample-device-1 sshd[12345]: Accepted publickey for user from 192.168.1.101 port 54321\nMay  1 12:00:05 sample-device-1 kernel: [12345.678901] TCP: request_sock_TCP: Possible SYN flooding on port 80. Sending cookies.\nMay  1 12:00:10 sample-device-1 systemd[1]: Started Daily apt download activities.",
  // Adding the missing properties to match NetworkData type
  open_ports: [
    {
      port: 22,
      protocol: "tcp",
      process: "sshd"
    },
    {
      port: 80,
      protocol: "tcp",
      process: "nginx"
    },
    {
      port: 443,
      protocol: "tcp",
      process: "nginx"
    }
  ],
  interface_io: {
    "lo": {
      bytes_sent_total: 1000000,
      bytes_recv_total: 1000000,
      packets_sent: 10000,
      packets_recv: 10000,
      errin: 0,
      errout: 0,
      delta_sent: 500,
      delta_recv: 500
    },
    "eth0": {
      bytes_sent_total: 2000000,
      bytes_recv_total: 5000000,
      packets_sent: 20000,
      packets_recv: 50000,
      errin: 0,
      errout: 0,
      delta_sent: 1000,
      delta_recv: 2000
    }
  },
  received_at: "2025-05-01T12:00:00Z"
};

export default sampleData;
