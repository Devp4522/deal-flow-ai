import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FinancialAssumptions, FinancialModelResult, FinancialModelRun } from '@/types/financial';

interface StartModelParams {
  ticker: string;
  companyName?: string;
  fiscalYearEnd: string;
  currency: string;
  assumptions: FinancialAssumptions;
  csvContent: string;
  workflowId?: string;
}

export function useFinancialModel() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('idle');
  const [result, setResult] = useState<FinancialModelResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const startModel = async (params: StartModelParams): Promise<{ jobId: string } | null> => {
    setIsProcessing(true);
    setStatus('queued');
    setError(null);
    setResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('You must be logged in to generate a model');
      }

      const { data, error: fnError } = await supabase.functions.invoke('process-financial-model', {
        body: {
          action: 'start',
          ticker: params.ticker,
          companyName: params.companyName,
          fiscalYearEnd: params.fiscalYearEnd,
          currency: params.currency,
          assumptions: params.assumptions,
          csvContent: params.csvContent,
          workflowId: params.workflowId,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to start model');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setStatus(data.status || 'done');
      setResult(data.result);
      setIsProcessing(false);

      toast({
        title: 'Model Generated',
        description: `DCF analysis completed for ${params.ticker}`,
      });

      return { jobId: data.job_id };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setStatus('failed');
      setIsProcessing(false);

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      return null;
    }
  };

  const getStatus = async (jobId: string): Promise<FinancialModelRun | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('process-financial-model', {
        body: { action: 'status', jobId },
      });

      if (fnError || data.error) {
        throw new Error(fnError?.message || data.error);
      }

      return data as FinancialModelRun;
    } catch (err) {
      console.error('Error fetching status:', err);
      return null;
    }
  };

  const getHistory = async (): Promise<FinancialModelRun[]> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('process-financial-model', {
        body: { action: 'history' },
      });

      if (fnError || data.error) {
        throw new Error(fnError?.message || data.error);
      }

      return data.runs || [];
    } catch (err) {
      console.error('Error fetching history:', err);
      return [];
    }
  };

  const reset = () => {
    setIsProcessing(false);
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  return {
    isProcessing,
    status,
    result,
    error,
    startModel,
    getStatus,
    getHistory,
    reset,
  };
}
