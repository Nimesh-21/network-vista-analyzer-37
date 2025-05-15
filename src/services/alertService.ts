import type { Alert } from '@/types/network';
import { toast } from '@/components/ui/use-toast';
import { mapField } from '@/alertMapping';

/**
 * Fetches alerts from our Next.js API route, which in turn reads MongoDB.
 */
export async function fetchAlerts(): Promise<Alert[]> {
  try {
    const res = await fetch('http://10.229.40.55:3000/api/alerts');
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    console.log(data);
    
    return data.alerts as Alert[];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    toast({
      title: 'Error Fetching Alerts',
      description: 'Could not retrieve alert data. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
}

/**
 * Converts numeric severity code to one of 'low', 'medium', 'high', or 'critical'
 */
export function getSeverityLevel(severity: number): 'low' | 'medium' | 'high' | 'critical' {
  const lvl = mapField('severity', severity).toLowerCase();
  if (lvl === 'low_risk') return 'low';
  if (lvl === 'medium_risk') return 'medium';
  if (lvl === 'high_risk') return 'high';
  return 'critical';
}

/**
 * Looks up the human-readable event name for a given eventName code
 */
export function getEventName(eventNameId: number): string {
  const name = mapField('eventName', eventNameId);
  return name !== String(eventNameId) ? name : 'Unknown Event';
}

/**
 * Formats the alert timestamp into a readable string
 */
export function formatAlertTimestamp(alert: Alert): string {
  const { day, month, year, hour, minute, second } = alert.MESSAGE;
  // e.g., "5/5/2025 11:20:06"
  return `${day}/${month}/${year} ${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}:${second.toString().padStart(2,'0')}`;
}
