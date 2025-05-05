
import { useState, useEffect } from 'react';
import { Alert } from '@/types/network';
import { fetchAlerts } from '@/services/alertService';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshAlerts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to fetch alerts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    refreshAlerts();
  }, []);
  
  return {
    alerts,
    isLoading,
    error,
    refreshAlerts
  };
}
