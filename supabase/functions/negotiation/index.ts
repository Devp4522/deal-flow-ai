import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Acceptance probability model (heuristic-based)
function calculateAcceptanceProbability(
  offerPrice: number,
  sellerAsk: number,
  cashPercent: number,
  escrowPercent: number,
  closingDays: number,
  hasCompetition: boolean,
  certaintyPriority: number
): number {
  let score = 0.5;
  
  // Price distance from ask (40% weight)
  const priceRatio = offerPrice / sellerAsk;
  if (priceRatio >= 1) score += 0.2;
  else if (priceRatio >= 0.95) score += 0.15;
  else if (priceRatio >= 0.9) score += 0.1;
  else if (priceRatio >= 0.85) score += 0.05;
  else score -= 0.1;

  // Cash vs earnout (20% weight)
  if (cashPercent >= 80) score += 0.1;
  else if (cashPercent >= 60) score += 0.05;
  else score -= 0.05;

  // Escrow (10% weight) - lower is better for seller
  if (escrowPercent <= 5) score += 0.05;
  else if (escrowPercent <= 10) score += 0.02;
  else score -= 0.05;

  // Speed of close (15% weight)
  if (closingDays <= 30) score += 0.08;
  else if (closingDays <= 60) score += 0.04;
  else if (closingDays <= 90) score += 0.02;
  else score -= 0.05;

  // Competition (10% weight)
  if (hasCompetition) score -= 0.05;

  // Certainty (5% weight)
  score += (certaintyPriority / 10) * 0.05;

  return Math.max(0, Math.min(1, score));
}

function generateOfferScenarios(inputs: any, fairValueLow?: number, fairValueHigh?: number) {
  const {
    seller_ask_price,
    acceptable_price_range,
    maximum_cash_at_close,
    desired_close_date,
    competing_bidders,
    certainty_priority,
    earnout_preferences,
    escrow_preferences,
    working_capital_adjustment,
  } = inputs;

  const sellerAsk = seller_ask_price || 100000000;
  const [priceLow, priceHigh] = acceptable_price_range || [sellerAsk * 0.85, sellerAsk * 1.05];
  const maxCash = maximum_cash_at_close || sellerAsk;
  const hasCompetition = competing_bidders === 'yes';
  const certainty = certainty_priority || 5;
  const closeDays = desired_close_date ? Math.ceil((new Date(desired_close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 60;

  // Use fair value bounds if available
  const valueLow = fairValueLow || priceLow;
  const valueHigh = fairValueHigh || priceHigh;

  const scenarios = [
    {
      label: "Aggressive",
      equity_value: Math.round(valueLow * 0.92),
      cash_percent: 60,
      earnout_cap_percent: 25,
      escrow_pct: 15,
      closing_days: 45,
    },
    {
      label: "Balanced",
      equity_value: Math.round((valueLow + valueHigh) / 2),
      cash_percent: 75,
      earnout_cap_percent: 15,
      escrow_pct: 10,
      closing_days: 60,
    },
    {
      label: "Defensive",
      equity_value: Math.round(valueHigh * 0.98),
      cash_percent: 85,
      earnout_cap_percent: 10,
      escrow_pct: 7,
      closing_days: 75,
    },
    {
      label: "Maximum Certainty",
      equity_value: Math.round(sellerAsk * 1.02),
      cash_percent: 95,
      earnout_cap_percent: 5,
      escrow_pct: 5,
      closing_days: 90,
    },
  ];

  return scenarios.map((scenario) => {
    const cashAtClose = Math.min(maxCash, Math.round(scenario.equity_value * (scenario.cash_percent / 100)));
    const earnoutCap = Math.round(scenario.equity_value * (scenario.earnout_cap_percent / 100));

    const acceptProb = calculateAcceptanceProbability(
      scenario.equity_value,
      sellerAsk,
      scenario.cash_percent,
      scenario.escrow_pct,
      scenario.closing_days,
      hasCompetition,
      certainty
    );

    const riskFlags: string[] = [];
    if (scenario.equity_value < valueLow * 0.9) riskFlags.push("Below fair value floor");
    if (scenario.earnout_cap_percent > 20) riskFlags.push("Earnout dispute risk");
    if (scenario.escrow_pct > 12) riskFlags.push("High escrow may deter seller");
    if (acceptProb < 0.4) riskFlags.push("LOW acceptance probability");

    return {
      label: scenario.label,
      equity_value: scenario.equity_value,
      cash_at_close: cashAtClose,
      earnout_terms: {
        metric: earnout_preferences?.metric || "EBITDA",
        period: earnout_preferences?.period || "2y",
        cap: earnoutCap,
      },
      escrow_pct: scenario.escrow_pct,
      working_capital: working_capital_adjustment || "peg + true-up",
      accept_prob: Math.round(acceptProb * 100) / 100,
      rationale: `${scenario.label} offer at ${Math.round((scenario.equity_value / sellerAsk) * 100)}% of ask with ${scenario.cash_percent}% cash.`,
      risk_flags: riskFlags,
      closing_days: scenario.closing_days,
    };
  });
}

function generatePlaybook(inputs: any, offers: any[]) {
  const sellerAsk = inputs.seller_ask_price || 100000000;
  const balancedOffer = offers.find((o) => o.label === "Balanced") || offers[1];

  return {
    opening_anchor: `Open at ${formatCurrency(offers[0].equity_value)} (${Math.round((offers[0].equity_value / sellerAsk) * 100)}% of ask) to establish negotiating room.`,
    expected_reactions: [
      "Seller likely to counter at or near ask price",
      "Expect pushback on earnout structure and escrow percentage",
      "Working capital adjustment methodology will be contested",
    ],
    concessions_ladder: [
      `Step 1: Move to ${formatCurrency(balancedOffer.equity_value)} if seller shows flexibility`,
      `Step 2: Increase cash at close to ${formatCurrency(balancedOffer.cash_at_close)}`,
      `Step 3: Reduce escrow to ${balancedOffer.escrow_pct - 2}% as final concession`,
      `Step 4: Agree to accelerated close timeline if at ceiling price`,
    ],
    key_talking_points: [
      "Emphasize certainty of close and track record",
      "Highlight synergy opportunities post-close",
      "Reference comparable transaction multiples",
      "Discuss earnout structure as alignment mechanism",
    ],
  };
}

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

function generateZOPA(inputs: any, fairValueLow?: number, fairValueHigh?: number): [number, number] {
  const sellerAsk = inputs.seller_ask_price || 100000000;
  const [priceLow] = inputs.acceptable_price_range || [sellerAsk * 0.85, sellerAsk * 1.05];
  
  const zopaLow = fairValueLow || priceLow;
  const zopaHigh = Math.min(sellerAsk * 1.05, fairValueHigh || sellerAsk);
  
  return [Math.round(zopaLow), Math.round(zopaHigh)];
}

function generateBATNA(inputs: any) {
  return {
    buyer: "Walk away and pursue alternative targets. Estimated search cost: 3-6 months, $500K in advisory fees.",
    seller: "Continue operating independently or pursue other suitors. Risk of market timing if delayed.",
  };
}

function generateMemo(inputs: any, offers: any[]) {
  const company = inputs.company_name || inputs.company?.name || "Target Company";
  const balancedOffer = offers.find((o) => o.label === "Balanced") || offers[1];
  
  return `**Internal Negotiation Memo**

**Target:** ${company}
**Date:** ${new Date().toISOString().split("T")[0]}

**Recommended Approach:**
We recommend opening with the Aggressive scenario at ${formatCurrency(offers[0].equity_value)} to establish negotiating room, with authority to move to the Balanced scenario at ${formatCurrency(balancedOffer.equity_value)}.

**Key Considerations:**
- Seller asking price: ${formatCurrency(inputs.seller_ask_price || 0)}
- Our acceptable range: ${formatCurrency(inputs.acceptable_price_range?.[0] || 0)} - ${formatCurrency(inputs.acceptable_price_range?.[1] || 0)}
- Competition: ${inputs.competing_bidders === "yes" ? "Yes - proceed with urgency" : "Unknown/None - leverage for concessions"}

**Risk Flags:**
${offers.flatMap((o) => o.risk_flags).filter((v, i, a) => a.indexOf(v) === i).map((f) => `- ${f}`).join("\n")}
`;
}

function generateDraftLOI(inputs: any, offers: any[]) {
  const company = inputs.company_name || inputs.company?.name || "Target Company";
  const balancedOffer = offers.find((o) => o.label === "Balanced") || offers[1];
  
  return `════════════════════════════════════════════
⚠️  INTERNAL DRAFT — NOT A LEGAL OFFER  ⚠️
════════════════════════════════════════════

LETTER OF INTENT

Date: ${new Date().toISOString().split("T")[0]}

Re: Proposed Acquisition of ${company}

Dear [Seller Representative],

We are pleased to submit this non-binding Letter of Intent for the proposed acquisition of ${company} (the "Company").

1. PURCHASE PRICE
   Total Enterprise Value: ${formatCurrency(balancedOffer.equity_value)}
   
2. CONSIDERATION
   - Cash at Closing: ${formatCurrency(balancedOffer.cash_at_close)}
   - Earnout: Up to ${formatCurrency(balancedOffer.earnout_terms.cap)} based on ${balancedOffer.earnout_terms.metric} targets over ${balancedOffer.earnout_terms.period}
   
3. ESCROW
   ${balancedOffer.escrow_pct}% of purchase price held for 18 months for indemnification claims

4. WORKING CAPITAL
   Adjustment: ${balancedOffer.working_capital}

5. DUE DILIGENCE
   45-day exclusivity period for confirmatory due diligence

6. CLOSING
   Target closing within ${balancedOffer.closing_days} days of signing definitive agreement

This letter is non-binding except for confidentiality and exclusivity provisions.

════════════════════════════════════════════
⚠️  INTERNAL DRAFT — NOT A LEGAL OFFER  ⚠️
════════════════════════════════════════════
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    console.log(`[negotiation] ${req.method} auth=${!!authHeader}`);

    if (!authHeader) {
      console.log("[negotiation] Missing authorization header");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[negotiation] Auth error:", authError?.message);
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[negotiation] User authenticated: ${user.id}`);

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    const body = req.method !== "GET" ? await req.json() : null;

    // Guard against external sending - reject any attempt
    if (body?.send_external || body?.external || body?.email_to) {
      console.error("[negotiation] BLOCKED: Attempt to send externally");
      await supabase.from("negotiation_audit").insert({
        negotiation_id: body.negotiation_id,
        action: "BLOCKED_EXTERNAL_SEND",
        payload: body,
        user_id: user.id,
      });
      return new Response(JSON.stringify({ error: "External sending is not permitted. All documents are internal only." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route handling
    if (path === "create-or-update" && req.method === "POST") {
      const { deal_id, company, inputs } = body;
      
      let negotiationId = deal_id;
      let currentRevision = 0;

      if (deal_id) {
        // Update existing
        const { data: existing, error: fetchError } = await supabase
          .from("negotiations")
          .select("*")
          .eq("id", deal_id)
          .single();

        if (fetchError || !existing) {
          return new Response(JSON.stringify({ error: "Negotiation not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        currentRevision = existing.current_revision + 1;

        await supabase
          .from("negotiations")
          .update({
            company,
            current_revision: currentRevision,
            state: "draft",
            updated_at: new Date().toISOString(),
          })
          .eq("id", deal_id);
      } else {
        // Create new
        const { data: newNeg, error: createError } = await supabase
          .from("negotiations")
          .insert({
            user_id: user.id,
            company,
            current_revision: 0,
            state: "draft",
          })
          .select()
          .single();

        if (createError) {
          console.error("[negotiation] Create error:", createError);
          return new Response(JSON.stringify({ error: "Failed to create negotiation" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        negotiationId = newNeg.id;
      }

      // Create revision
      await supabase.from("negotiation_revisions").insert({
        negotiation_id: negotiationId,
        revision: currentRevision,
        inputs,
      });

      // Audit log
      await supabase.from("negotiation_audit").insert({
        negotiation_id: negotiationId,
        action: deal_id ? "UPDATE" : "CREATE",
        payload: { company, inputs },
        user_id: user.id,
      });

      // Update usage - upsert with increment
      const { data: existingUsage } = await supabase
        .from("negotiation_usage")
        .select("usage_count")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingUsage) {
        await supabase
          .from("negotiation_usage")
          .update({
            usage_count: existingUsage.usage_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("negotiation_usage").insert({
          user_id: user.id,
          usage_count: 1,
          last_used_at: new Date().toISOString(),
        });
      }

      return new Response(JSON.stringify({
        negotiation_id: negotiationId,
        revision: currentRevision,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "generate" && req.method === "POST") {
      const { negotiation_id, inputs, valuation_data, modeling_data } = body;

      if (!negotiation_id) {
        return new Response(JSON.stringify({ error: "negotiation_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get current negotiation
      const { data: negotiation, error: negError } = await supabase
        .from("negotiations")
        .select("*")
        .eq("id", negotiation_id)
        .single();

      if (negError || !negotiation) {
        return new Response(JSON.stringify({ error: "Negotiation not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Use valuation data if provided
      const fairValueLow = valuation_data?.fair_value_low;
      const fairValueHigh = valuation_data?.fair_value_high;

      // Generate scenarios
      const offers = generateOfferScenarios(inputs, fairValueLow, fairValueHigh);
      const zopa = generateZOPA(inputs, fairValueLow, fairValueHigh);
      const batna = generateBATNA(inputs);
      const playbook = generatePlaybook(inputs, offers);
      const memo = generateMemo(inputs, offers);
      const draftLoi = generateDraftLOI(inputs, offers);

      // Determine risk flags
      const riskFlags: string[] = [];
      offers.forEach((o) => riskFlags.push(...o.risk_flags));
      const uniqueRisks = [...new Set(riskFlags)];
      const hasHighRisk = uniqueRisks.some((r) => r.includes("LOW") || r.includes("Below fair"));

      const newRevision = negotiation.current_revision + 1;
      const newState = hasHighRisk ? "pending_approval" : "draft";

      // Store results
      const results = {
        offers,
        zopa,
        batna,
        playbook,
        memo,
        draft_loi: draftLoi,
        revision: newRevision,
      };

      // Create new revision with results
      await supabase.from("negotiation_revisions").insert({
        negotiation_id,
        revision: newRevision,
        inputs,
        results,
        risk_flags: uniqueRisks,
      });

      // Update negotiation
      await supabase
        .from("negotiations")
        .update({
          current_revision: newRevision,
          state: newState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", negotiation_id);

      // Audit log
      await supabase.from("negotiation_audit").insert({
        negotiation_id,
        action: "GENERATE",
        payload: { revision: newRevision, risk_flags: uniqueRisks },
        user_id: user.id,
      });

      return new Response(JSON.stringify({
        ...results,
        requires_approval: hasHighRisk,
        state: newState,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "approve" && req.method === "POST") {
      const { negotiation_id, revision, approved, reason } = body;

      if (!negotiation_id || revision === undefined || approved === undefined || !reason) {
        return new Response(JSON.stringify({ error: "negotiation_id, revision, approved, and reason are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create approval record
      await supabase.from("negotiation_approvals").insert({
        negotiation_id,
        revision,
        user_id: user.id,
        decision: approved ? "approved" : "rejected",
        reason,
      });

      // Update negotiation state
      await supabase
        .from("negotiations")
        .update({
          state: approved ? "approved" : "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", negotiation_id);

      // Audit log
      await supabase.from("negotiation_audit").insert({
        negotiation_id,
        action: approved ? "APPROVED" : "REJECTED",
        payload: { revision, reason },
        user_id: user.id,
      });

      return new Response(JSON.stringify({
        success: true,
        decision: approved ? "approved" : "rejected",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "history" && req.method === "GET") {
      const negotiationId = url.searchParams.get("negotiation_id");

      if (!negotiationId) {
        return new Response(JSON.stringify({ error: "negotiation_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get revisions
      const { data: revisions, error: revError } = await supabase
        .from("negotiation_revisions")
        .select("*")
        .eq("negotiation_id", negotiationId)
        .order("revision", { ascending: false });

      // Get approvals
      const { data: approvals, error: appError } = await supabase
        .from("negotiation_approvals")
        .select("*")
        .eq("negotiation_id", negotiationId)
        .order("created_at", { ascending: false });

      return new Response(JSON.stringify({
        revisions: revisions || [],
        approvals: approvals || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "list" && req.method === "GET") {
      const { data: negotiations, error } = await supabase
        .from("negotiations")
        .select("*")
        .order("updated_at", { ascending: false });

      return new Response(JSON.stringify({
        negotiations: negotiations || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown endpoint" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("[negotiation] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
