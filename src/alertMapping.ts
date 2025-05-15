export const fieldMappings = {
    sourceId: {
      10: 'NDR',
      2: 'WCM',
      3: 'DBA',
      4: 'SIEM',
      6: 'WAF',
      7: 'UEBA',
      11: 'SOAR',
      13: 'DAM'
      // add other sourceId mappings here
    },
    destId: {
        10: 'NDR',
        2: 'WCM',
        3: 'DBA',
        4: 'SIEM',
        6: 'WAF',
        7: 'UEBA',
        11: 'SOAR',
        13: 'DAM'
      // add other destId mappings here
    },
    severity: {
      2: 'LOW_RISK',
      3: 'MEDIUM_RISK',
      4: 'HIGH_RISK',
      5: 'CRITICAL',
      8: 'WARNING',
      10: 'CRITICAL',
      11: 'ALERT',
      12: 'EMERGENCY',
    },
    eventType: {
      // example: 5: 'Port Scan',
      1: 'AUTHENTICATION_EVENTS',
      5: 'NETWORK_EVENTS'
    },
    eventName: {
      // example: 36: 'Clustering Detection',
      0: 'NA',
      7: 'CREDENTIAL_MISUSE',
      31: 'CONNECTION_ALLOWED',
      32: 'CONNECTION_DENIED',
      36: 'PORT_SCAN_DETECTED',
      37: 'LATERAL_MOVEMENT_ATTEMPT',
      38: 'MALWARE_DETECTED',
      55: 'ABNORMAL_LOGIN',
      58: 'LATERAL_MOVEMENT'
    },
    port:{
        0: 'ALL'
    }
  };

  /**
 * Helper to map a numeric code to its human-readable meaning.
 * @param category - key from fieldMappings
 * @param code - numeric code from the payload
 */
export function mapField(category: keyof typeof fieldMappings, code: number | string): string {
    const mapping = fieldMappings[category];
    // if code is string or missing mapping, return as-is
    return typeof code === 'number' && mapping
      ? (mapping[code] || String(code))
      : String(code);
  }
  