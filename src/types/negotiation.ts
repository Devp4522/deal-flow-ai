export interface NegotiationInputs {
  target_company: string;
  company_name?: string;
  ticker?: string;
  seller_ask_price: number;
  acceptable_price_range: [number, number];
  maximum_cash_at_close: number;
  desired_close_date: string;
  must_have_terms: string[];
  competing_bidders: 'yes' | 'no' | 'unknown';
  certainty_priority: number;
  earnout_preferences?: {
    metric: string;
    period: string;
    cap?: number;
  };
  escrow_preferences?: {
    percentage: number;
    duration_months: number;
  };
  working_capital_adjustment?: string;
}

export interface EarnoutTerms {
  metric: string;
  period: string;
  cap: number;
}

export interface OfferScenario {
  label: string;
  equity_value: number;
  cash_at_close: number;
  earnout_terms: EarnoutTerms;
  escrow_pct: number;
  working_capital: string;
  accept_prob: number;
  rationale: string;
  risk_flags: string[];
  closing_days: number;
}

export interface Playbook {
  opening_anchor: string;
  expected_reactions: string[];
  concessions_ladder: string[];
  key_talking_points: string[];
}

export interface BATNA {
  buyer: string;
  seller: string;
}

export interface NegotiationResults {
  offers: OfferScenario[];
  zopa: [number, number];
  batna: BATNA;
  playbook: Playbook;
  memo: string;
  draft_loi: string;
  revision: number;
  requires_approval?: boolean;
  state?: string;
}

export interface Negotiation {
  id: string;
  user_id: string;
  company: {
    ticker?: string;
    name?: string;
  };
  current_revision: number;
  state: 'draft' | 'pending_approval' | 'approved' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface NegotiationRevision {
  id: string;
  negotiation_id: string;
  revision: number;
  inputs: NegotiationInputs;
  results: NegotiationResults | null;
  risk_flags: string[];
  created_at: string;
}

export interface NegotiationApproval {
  id: string;
  negotiation_id: string;
  revision: number;
  user_id: string;
  decision: 'approved' | 'rejected';
  reason: string;
  created_at: string;
}
