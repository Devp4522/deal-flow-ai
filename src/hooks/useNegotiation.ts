import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  NegotiationInputs, 
  NegotiationResults, 
  Negotiation,
  NegotiationRevision,
  NegotiationApproval
} from '@/types/negotiation';

export function useNegotiation() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentNegotiation, setCurrentNegotiation] = useState<Negotiation | null>(null);
  const [results, setResults] = useState<NegotiationResults | null>(null);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const { toast } = useToast();

  const createOrUpdate = async (
    inputs: NegotiationInputs,
    company: { ticker?: string; name?: string },
    dealId?: string
  ) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/negotiation/create-or-update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            deal_id: dealId,
            company,
            inputs,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create/update negotiation');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generate = async (
    negotiationId: string,
    inputs: NegotiationInputs,
    valuationData?: { fair_value_low?: number; fair_value_high?: number },
    modelingData?: any
  ) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/negotiation/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            negotiation_id: negotiationId,
            inputs,
            valuation_data: valuationData,
            modeling_data: modelingData,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate scenarios');
      }

      const data: NegotiationResults = await response.json();
      setResults(data);
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const approve = async (
    negotiationId: string,
    revision: number,
    approved: boolean,
    reason: string
  ) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/negotiation/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            negotiation_id: negotiationId,
            revision,
            approved,
            reason,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit approval');
      }

      const data = await response.json();
      toast({
        title: approved ? 'Approved' : 'Rejected',
        description: `Revision ${revision} has been ${approved ? 'approved' : 'rejected'}.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getHistory = async (negotiationId: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/negotiation/history?negotiation_id=${negotiationId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch history');
      }

      return await response.json() as {
        revisions: NegotiationRevision[];
        approvals: NegotiationApproval[];
      };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const listNegotiations = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/negotiation/list`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to list negotiations');
      }

      const data = await response.json();
      setNegotiations(data.negotiations || []);
      return data.negotiations as Negotiation[];
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    currentNegotiation,
    results,
    negotiations,
    createOrUpdate,
    generate,
    approve,
    getHistory,
    listNegotiations,
    setResults,
  };
}
