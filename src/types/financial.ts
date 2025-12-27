export interface FinancialAssumptions {
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

export interface CompanyMetadata {
  ticker: string;
  companyName?: string;
  fiscalYearEnd: string;
  currency: string;
}

export interface FinancialModelRun {
  id: string;
  user_id: string;
  ticker: string;
  company_name: string | null;
  fiscal_year_end: string | null;
  currency: string | null;
  workflow_id: string | null;
  assumptions: FinancialAssumptions | null;
  status: 'queued' | 'parsing' | 'validating' | 'modelling' | 'generating' | 'done' | 'failed';
  error_text: string | null;
  result_json: FinancialModelResult | null;
  dcf_summary: DCFSummary | null;
  checks: ModelChecks | null;
  provenance: Provenance | null;
  created_at: string;
  completed_at: string | null;
}

export interface FinancialData {
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

export interface DCFSummary {
  npv: number;
  wacc: number;
  terminalValue: number;
  enterpriseValue: number;
  sensitivityMatrix: Array<Array<{ wacc: number; tgr: number; ev: number }>>;
}

export interface ModelChecks {
  balanced: boolean;
  warnings: string[];
}

export interface Provenance {
  ticker: string;
  company_name?: string;
  generated_at: string;
  agent_version: string;
}

export interface FinancialModelResult {
  income_table: FinancialData[];
  forecasted_income: FinancialData[];
  assumptions: FinancialAssumptions;
  dcf: DCFSummary;
  checks: ModelChecks;
  provenance: Provenance;
}

export const DEFAULT_ASSUMPTIONS: FinancialAssumptions = {
  forecastHorizon: 5,
  revenueGrowthRates: [0.05, 0.05, 0.04, 0.04, 0.03],
  operatingMargin: 0.15,
  taxRate: 0.25,
  capexPercent: 0.05,
  depreciationPercent: 0.03,
  wcDays: { dso: 45, dio: 60, dpo: 30 },
  terminalGrowthRate: 0.025,
  wacc: 0.10,
};
