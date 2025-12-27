import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UsageData {
  remaining: number;
  used: number;
  max: number;
  lastUsedAt: string | null;
}

export function useResearchUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setUsage(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-research-usage');

      if (fnError) {
        throw new Error(fnError.message);
      }

      setUsage(data as UsageData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch usage';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const updateRemaining = useCallback((remaining: number) => {
    if (usage) {
      setUsage({
        ...usage,
        remaining,
        used: usage.max - remaining,
        lastUsedAt: new Date().toISOString(),
      });
    }
  }, [usage]);

  return {
    usage,
    loading,
    error,
    refetch: fetchUsage,
    updateRemaining,
  };
}
