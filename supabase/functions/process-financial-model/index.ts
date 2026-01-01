import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Assumptions {
  forecastHorizon: number;
  revenueGrowthRates: number[];
  operatingMargin: number;
  taxRate: number;
  capexPercent: number;
  depreciationPercent: number;
  wcDays: { dso: number; dio: number; dpo: number };
  terminalGrowthRate: number;
  wacc: number;
}

interface FinancialData {
  period: string;
  revenue?: number;
  cogs?: number;
  grossProfit?: number;
  opex?: number;
  depreciation?: number;
  interest?: number;
  tax?: number;
  netIncome?: number;
  ebitda?: number;
  [key: string]: string | number | undefined;
}

function parseCSV(csvContent: string): FinancialData[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  const data: FinancialData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: FinancialData = { period: '' };
    
    headers.forEach((header, idx) => {
      const value = values[idx];
      if (header.includes('period') || header.includes('date') || header.includes('year')) {
        row.period = value;
      } else if (header.includes('revenue') || header.includes('sales')) {
        row.revenue = parseFloat(value) || 0;
      } else if (header.includes('cogs') || header.includes('cost_of_goods') || header.includes('cost_of_sales')) {
        row.cogs = parseFloat(value) || 0;
      } else if (header.includes('gross_profit')) {
        row.grossProfit = parseFloat(value) || 0;
      } else if (header.includes('opex') || header.includes('operating_expense')) {
        row.opex = parseFloat(value) || 0;
      } else if (header.includes('depreciation') || header.includes('d_a')) {
        row.depreciation = parseFloat(value) || 0;
      } else if (header.includes('interest')) {
        row.interest = parseFloat(value) || 0;
      } else if (header.includes('tax')) {
        row.tax = parseFloat(value) || 0;
      } else if (header.includes('net_income') || header.includes('net_profit')) {
        row.netIncome = parseFloat(value) || 0;
      } else if (header.includes('ebitda')) {
        row.ebitda = parseFloat(value) || 0;
      } else {
        row[header] = isNaN(parseFloat(value)) ? value : parseFloat(value);
      }
    });

    // Calculate missing values
    if (row.revenue && row.cogs && !row.grossProfit) {
      row.grossProfit = row.revenue - row.cogs;
    }
    if (row.grossProfit && row.opex && !row.ebitda) {
      row.ebitda = row.grossProfit - row.opex + (row.depreciation || 0);
    }

    data.push(row);
  }

  return data;
}

function computeDCF(
  historicalData: FinancialData[],
  assumptions: Assumptions
): {
  forecastedIncome: FinancialData[];
  dcf: { npv: number; wacc: number; terminalValue: number; enterpriseValue: number; sensitivityMatrix: Record<string, number>[][] };
  checks: { balanced: boolean; warnings: string[] };
} {
  const warnings: string[] = [];
  
  // Get the latest period data
  const latestData = historicalData[historicalData.length - 1];
  if (!latestData?.revenue) {
    warnings.push('Missing revenue data in historical financials');
  }

  const baseRevenue = latestData?.revenue || 1000000;
  const baseMargin = assumptions.operatingMargin;
  const forecastedIncome: FinancialData[] = [];

  // Generate forecast
  let cumulativeRevenue = baseRevenue;
  for (let year = 1; year <= assumptions.forecastHorizon; year++) {
    const growthRate = assumptions.revenueGrowthRates[year - 1] || assumptions.revenueGrowthRates[0] || 0.05;
    cumulativeRevenue = cumulativeRevenue * (1 + growthRate);
    
    const revenue = cumulativeRevenue;
    const cogs = revenue * (1 - baseMargin - 0.1); // Assuming 10% gross margin above operating margin
    const grossProfit = revenue - cogs;
    const opex = revenue * 0.1;
    const depreciation = revenue * assumptions.depreciationPercent;
    const ebitda = grossProfit - opex + depreciation;
    const ebit = ebitda - depreciation;
    const interest = 0; // Simplified
    const taxableIncome = ebit - interest;
    const tax = taxableIncome * assumptions.taxRate;
    const netIncome = taxableIncome - tax;

    forecastedIncome.push({
      period: `FY+${year}`,
      revenue: Math.round(revenue),
      cogs: Math.round(cogs),
      grossProfit: Math.round(grossProfit),
      opex: Math.round(opex),
      depreciation: Math.round(depreciation),
      ebitda: Math.round(ebitda),
      interest: Math.round(interest),
      tax: Math.round(tax),
      netIncome: Math.round(netIncome),
    });
  }

  // Calculate Free Cash Flow for each year
  const fcfs = forecastedIncome.map((item, idx) => {
    const ebit = (item.ebitda || 0) - (item.depreciation || 0);
    const nopat = ebit * (1 - assumptions.taxRate);
    const capex = (item.revenue || 0) * assumptions.capexPercent;
    const dwc = idx === 0 
      ? 0 
      : ((item.revenue || 0) - (forecastedIncome[idx - 1]?.revenue || 0)) * 0.1; // Simplified working capital change
    const fcf = nopat + (item.depreciation || 0) - capex - dwc;
    return fcf;
  });

  // Calculate present values
  const discountedFcfs = fcfs.map((fcf, idx) => {
    return fcf / Math.pow(1 + assumptions.wacc, idx + 1);
  });

  // Terminal value (Gordon Growth Model)
  const lastFcf = fcfs[fcfs.length - 1];
  const terminalValue = (lastFcf * (1 + assumptions.terminalGrowthRate)) / (assumptions.wacc - assumptions.terminalGrowthRate);
  const discountedTerminalValue = terminalValue / Math.pow(1 + assumptions.wacc, assumptions.forecastHorizon);

  // Enterprise value
  const pvOfFcfs = discountedFcfs.reduce((sum, pv) => sum + pv, 0);
  const enterpriseValue = pvOfFcfs + discountedTerminalValue;

  // Sensitivity matrix (WACC vs Terminal Growth)
  const waccRange = [-0.01, 0, 0.01];
  const tgrRange = [-0.005, 0, 0.005];
  
  const sensitivityMatrix = waccRange.map(waccDelta => {
    return tgrRange.map(tgrDelta => {
      const adjWacc = assumptions.wacc + waccDelta;
      const adjTgr = assumptions.terminalGrowthRate + tgrDelta;
      const adjTV = (lastFcf * (1 + adjTgr)) / (adjWacc - adjTgr);
      const adjDiscTV = adjTV / Math.pow(1 + adjWacc, assumptions.forecastHorizon);
      const adjPvFcfs = fcfs.map((fcf, idx) => fcf / Math.pow(1 + adjWacc, idx + 1)).reduce((a, b) => a + b, 0);
      return { wacc: adjWacc, tgr: adjTgr, ev: Math.round(adjPvFcfs + adjDiscTV) };
    });
  });

  return {
    forecastedIncome,
    dcf: {
      npv: Math.round(enterpriseValue),
      wacc: assumptions.wacc,
      terminalValue: Math.round(terminalValue),
      enterpriseValue: Math.round(enterpriseValue),
      sensitivityMatrix,
    },
    checks: {
      balanced: warnings.length === 0,
      warnings,
    },
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    console.log(`[process-financial-model] ${req.method} auth=${!!authHeader}`);

    if (!authHeader) {
      console.log('[process-financial-model] Missing authorization header');
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's JWT for RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user from the JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[process-financial-model] Auth error:', authError?.message);
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[process-financial-model] User authenticated: ${user.id}`);

    const { action, ...payload } = await req.json();

    if (action === 'start') {
      const { ticker, companyName, fiscalYearEnd, currency, assumptions, csvContent, workflowId } = payload;

      if (!ticker || !csvContent) {
        return new Response(JSON.stringify({ error: 'Ticker and CSV content are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create run record
      const { data: run, error: runError } = await supabase
        .from('financial_model_runs')
        .insert({
          user_id: user.id,
          ticker,
          company_name: companyName,
          fiscal_year_end: fiscalYearEnd,
          currency: currency || 'USD',
          workflow_id: workflowId,
          assumptions,
          status: 'parsing',
        })
        .select()
        .single();

      if (runError) {
        console.error('Error creating run:', runError);
        return new Response(JSON.stringify({ error: 'Failed to create model run' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Parse CSV
      const historicalData = parseCSV(csvContent);
      
      if (historicalData.length === 0) {
        await supabase
          .from('financial_model_runs')
          .update({ status: 'failed', error_text: 'Failed to parse CSV data' })
          .eq('id', run.id);
        
        return new Response(JSON.stringify({ error: 'Failed to parse CSV data' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update status to modelling
      await supabase
        .from('financial_model_runs')
        .update({ status: 'modelling' })
        .eq('id', run.id);

      // Default assumptions
      const defaultAssumptions: Assumptions = {
        forecastHorizon: assumptions?.forecastHorizon || 5,
        revenueGrowthRates: assumptions?.revenueGrowthRates || [0.05, 0.05, 0.04, 0.04, 0.03],
        operatingMargin: assumptions?.operatingMargin || 0.15,
        taxRate: assumptions?.taxRate || 0.25,
        capexPercent: assumptions?.capexPercent || 0.05,
        depreciationPercent: assumptions?.depreciationPercent || 0.03,
        wcDays: assumptions?.wcDays || { dso: 45, dio: 60, dpo: 30 },
        terminalGrowthRate: assumptions?.terminalGrowthRate || 0.025,
        wacc: assumptions?.wacc || 0.10,
      };

      // Compute DCF
      const { forecastedIncome, dcf, checks } = computeDCF(historicalData, defaultAssumptions);

      // Build result JSON
      const resultJson = {
        income_table: historicalData,
        forecasted_income: forecastedIncome,
        assumptions: defaultAssumptions,
        dcf,
        checks,
        provenance: {
          ticker,
          company_name: companyName,
          generated_at: new Date().toISOString(),
          agent_version: 'v1.0.0',
        },
      };

      // Update run with results
      const { error: updateError } = await supabase
        .from('financial_model_runs')
        .update({
          status: 'done',
          result_json: resultJson,
          dcf_summary: dcf,
          checks,
          provenance: resultJson.provenance,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id);

      if (updateError) {
        console.error('Error updating run:', updateError);
      }

      // Create audit record
      await supabase
        .from('financial_model_audit')
        .insert({
          run_id: run.id,
          prompt_version: 'v1.0',
          agent_version_hash: 'mvp-1.0.0',
          notes: 'Deterministic DCF calculation completed',
        });

      return new Response(JSON.stringify({ 
        job_id: run.id, 
        status: 'done',
        result: resultJson 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'status') {
      const { jobId } = payload;

      const { data: run, error } = await supabase
        .from('financial_model_runs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single();

      if (error || !run) {
        return new Response(JSON.stringify({ error: 'Run not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(run), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'history') {
      const { data: runs, error } = await supabase
        .from('financial_model_runs')
        .select('id, ticker, company_name, status, created_at, completed_at, dcf_summary')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch history' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ runs }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-financial-model:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
