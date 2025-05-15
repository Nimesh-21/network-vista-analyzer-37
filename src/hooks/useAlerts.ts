import { useState, useEffect, useCallback } from 'react';
import type { Alert } from '@/types/network';
import { fetchAlerts } from '@/services/alertService';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the service to fetch alerts
      const fetched = await fetchAlerts();
      setAlerts(fetched);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      setError(err.message || 'Failed to fetch alerts.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAlerts();
  }, [refreshAlerts]);

  return {
    alerts,
    isLoading,
    error,
    refreshAlerts
  };
}