import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CompanyReport, AnalysisStep } from '@/types/research';
import { useToast } from '@/hooks/use-toast';

interface AnalyzeResult extends CompanyReport {
  remaining?: number;
}

export function useCompanyResearch() {
  const [report, setReport] = useState<CompanyReport | null>(null);
  const [step, setStep] = useState<AnalysisStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const { toast } = useToast();

  const analyzeCompany = useCallback(async (ticker: string): Promise<AnalyzeResult | null> => {
    setError(null);
    setReport(null);
    setStep('fetching');

    try {
      // Simulate progress steps
      await new Promise(resolve => setTimeout(resolve, 500));
      setStep('analyzing');
      
      const { data, error: fnError } = await supabase.functions.invoke('analyze-company', {
        body: { ticker: ticker.toUpperCase().trim() }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to analyze company');
      }

      if (data.error) {
        if (data.code === 'quota_exhausted') {
          setRemaining(0);
          throw new Error('Research quota exhausted. You have used all 3 research analyses.');
        }
        if (data.code === 'auth_required' || data.code === 'auth_invalid') {
          throw new Error('Please sign in to use the research feature.');
        }
        throw new Error(data.error);
      }

      setStep('generating');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setReport(data as CompanyReport);
      setStep('complete');
      
      if (data.remaining !== undefined) {
        setRemaining(data.remaining);
      }
      
      toast({
        title: 'Analysis Complete',
        description: `Successfully analyzed ${data.companyName}`,
      });

      return data as AnalyzeResult;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      setStep('error');
      
      toast({
        title: 'Analysis Failed',
        description: message,
        variant: 'destructive',
      });
      
      return null;
    }
  }, [toast]);

  const updateRemaining = useCallback((value: number) => {
    setRemaining(value);
  }, []);

  const saveReport = useCallback(async () => {
    if (!report) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Sign in Required',
          description: 'Please sign in to save reports',
          variant: 'destructive',
        });
        return;
      }

      const { error: insertError } = await supabase
        .from('company_reports')
        .insert({
          user_id: user.id,
          ticker: report.ticker,
          company_name: report.companyName,
          report_data: JSON.parse(JSON.stringify(report.brief)),
          comparable_companies: JSON.parse(JSON.stringify(report.comparables)),
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Report Saved',
        description: 'Your report has been saved to your account',
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save report';
      toast({
        title: 'Save Failed',
        description: message,
        variant: 'destructive',
      });
    }
  }, [report, toast]);

  const reset = useCallback(() => {
    setReport(null);
    setStep('idle');
    setError(null);
  }, []);

  return {
    report,
    step,
    error,
    remaining,
    analyzeCompany,
    saveReport,
    reset,
    updateRemaining,
  };
}
