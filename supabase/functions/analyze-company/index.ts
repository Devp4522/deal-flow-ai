import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RESEARCH_USES = 3;

interface CompanyOverview {
  Symbol: string;
  Name: string;
  Description: string;
  Exchange: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  DividendYield: string;
  EPS: string;
  RevenueTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnEquityTTM: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
}

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  time_published: string;
  overall_sentiment_label: string;
}

async function getOrCreateUsage(supabase: any, userId: string) {
  // Try to get existing usage
  const { data: existingUsage, error: selectError } = await supabase
    .from('user_research_usage')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (selectError) {
    console.error('Error fetching usage:', selectError);
    throw new Error('Failed to check usage quota');
  }

  if (existingUsage) {
    return existingUsage;
  }

  // Create new usage record
  const { data: newUsage, error: insertError } = await supabase
    .from('user_research_usage')
    .insert({ user_id: userId, usage_count: 0 })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating usage:', insertError);
    throw new Error('Failed to initialize usage quota');
  }

  return newUsage;
}

async function incrementUsage(supabase: any, userId: string, currentCount: number) {
  const { data, error } = await supabase
    .from('user_research_usage')
    .update({ 
      usage_count: currentCount + 1,
      last_used_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('usage_count', currentCount) // Optimistic locking to prevent race conditions
    .select()
    .single();

  if (error || !data) {
    console.error('Error incrementing usage:', error);
    throw new Error('Failed to update usage quota. Please try again.');
  }

  return data;
}

async function fetchCompanyOverview(ticker: string, apiKey: string): Promise<CompanyOverview | null> {
  console.log(`Fetching company overview for ${ticker}`);
  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.Note) {
    console.error('Alpha Vantage rate limit:', data.Note);
    throw new Error('API rate limit reached. Please try again tomorrow.');
  }
  
  if (!data.Symbol) {
    console.log('No company data found for ticker:', ticker);
    return null;
  }
  
  return data as CompanyOverview;
}

async function fetchCompanyNews(ticker: string, apiKey: string): Promise<NewsItem[]> {
  console.log(`Fetching news for ${ticker}`);
  const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&limit=5&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.Note) {
    console.error('Alpha Vantage rate limit:', data.Note);
    return [];
  }
  
  if (!data.feed) {
    return [];
  }
  
  return data.feed.slice(0, 5).map((item: any) => ({
    title: item.title,
    summary: item.summary,
    source: item.source,
    time_published: item.time_published,
    overall_sentiment_label: item.overall_sentiment_label,
  }));
}

async function analyzeWithAI(companyData: CompanyOverview, newsData: NewsItem[]): Promise<{ brief: any; comparables: any[] }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  const prompt = `You are a senior M&A analyst. Analyze the following company data and provide a comprehensive analysis.

COMPANY DATA:
- Name: ${companyData.Name}
- Ticker: ${companyData.Symbol}
- Sector: ${companyData.Sector}
- Industry: ${companyData.Industry}
- Description: ${companyData.Description}
- Market Cap: ${companyData.MarketCapitalization}
- P/E Ratio: ${companyData.PERatio}
- EPS: ${companyData.EPS}
- Revenue TTM: ${companyData.RevenueTTM}
- Profit Margin: ${companyData.ProfitMargin}
- Operating Margin: ${companyData.OperatingMarginTTM}
- ROE: ${companyData.ReturnOnEquityTTM}
- Beta: ${companyData.Beta}
- 52-Week High: ${companyData['52WeekHigh']}
- 52-Week Low: ${companyData['52WeekLow']}
- Dividend Yield: ${companyData.DividendYield}

RECENT NEWS:
${newsData.map(n => `- ${n.title} (Sentiment: ${n.overall_sentiment_label})`).join('\n')}

Provide your analysis in the following JSON format ONLY (no markdown, no code blocks, just pure JSON):
{
  "brief": {
    "overview": "2-3 sentence company overview",
    "businessModel": "Description of how the company makes money (2-3 sentences)",
    "financials": "Key financial highlights and health assessment (2-3 sentences)",
    "risks": ["risk 1", "risk 2", "risk 3"],
    "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"]
  },
  "comparables": [
    {
      "companyName": "Company Name 1",
      "ticker": "TICK1",
      "similarityScore": 85,
      "reasoning": "Brief explanation of why this is a comparable",
      "keyMetrics": {
        "marketCap": "$XXB",
        "peRatio": "XX",
        "sector": "Sector Name"
      }
    },
    {
      "companyName": "Company Name 2",
      "ticker": "TICK2",
      "similarityScore": 78,
      "reasoning": "Brief explanation",
      "keyMetrics": {
        "marketCap": "$XXB",
        "peRatio": "XX",
        "sector": "Sector Name"
      }
    },
    {
      "companyName": "Company Name 3",
      "ticker": "TICK3",
      "similarityScore": 72,
      "reasoning": "Brief explanation",
      "keyMetrics": {
        "marketCap": "$XXB",
        "peRatio": "XX",
        "sector": "Sector Name"
      }
    }
  ]
}`;

  console.log('Calling Lovable AI for analysis...');
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are a senior M&A analyst. Always respond with valid JSON only, no markdown formatting.' },
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('AI rate limit exceeded. Please try again later.');
    }
    if (response.status === 402) {
      throw new Error('AI credits exhausted. Please add funds to continue.');
    }
    const errorText = await response.text();
    console.error('AI API error:', response.status, errorText);
    throw new Error('AI analysis failed');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('Empty AI response');
  }

  console.log('AI response received, parsing...');
  
  // Clean the response - remove any markdown formatting
  let cleanContent = content.trim();
  if (cleanContent.startsWith('```json')) {
    cleanContent = cleanContent.slice(7);
  }
  if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.slice(3);
  }
  if (cleanContent.endsWith('```')) {
    cleanContent = cleanContent.slice(0, -3);
  }
  cleanContent = cleanContent.trim();

  try {
    const parsed = JSON.parse(cleanContent);
    return {
      brief: parsed.brief,
      comparables: parsed.comparables,
    };
  } catch (e) {
    console.error('Failed to parse AI response:', cleanContent);
    throw new Error('Failed to parse AI analysis');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required', code: 'auth_required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with the user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', code: 'auth_invalid' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} requesting analysis`);

    // Check usage quota
    const usage = await getOrCreateUsage(supabase, user.id);
    const remaining = MAX_RESEARCH_USES - usage.usage_count;

    if (remaining <= 0) {
      console.log(`User ${user.id} has exhausted quota`);
      return new Response(
        JSON.stringify({ 
          error: 'Research quota exhausted. You have used all 3 research analyses.',
          code: 'quota_exhausted',
          remaining: 0
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { ticker } = await req.json();
    
    if (!ticker || typeof ticker !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid ticker provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanTicker = ticker.toUpperCase().trim();
    
    if (cleanTicker.length > 5 || !/^[A-Z]+$/.test(cleanTicker)) {
      return new Response(
        JSON.stringify({ error: 'Invalid ticker format. Use uppercase letters only, max 5 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ALPHA_VANTAGE_KEY = Deno.env.get('ALPHA_VANTAGE_KEY');
    
    if (!ALPHA_VANTAGE_KEY) {
      console.error('ALPHA_VANTAGE_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting analysis for ticker: ${cleanTicker}`);

    // Step 1: Fetch company data
    const companyData = await fetchCompanyOverview(cleanTicker, ALPHA_VANTAGE_KEY);
    
    if (!companyData) {
      return new Response(
        JSON.stringify({ error: `Ticker "${cleanTicker}" not found. Please check the symbol and try again.` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Fetch news
    const newsData = await fetchCompanyNews(cleanTicker, ALPHA_VANTAGE_KEY);

    // Step 3: Analyze with AI
    const analysis = await analyzeWithAI(companyData, newsData);

    // Step 4: Increment usage (with optimistic locking)
    const updatedUsage = await incrementUsage(supabase, user.id, usage.usage_count);
    const newRemaining = MAX_RESEARCH_USES - updatedUsage.usage_count;

    const result = {
      ticker: cleanTicker,
      companyName: companyData.Name,
      rawData: {
        sector: companyData.Sector,
        industry: companyData.Industry,
        marketCap: companyData.MarketCapitalization,
        peRatio: companyData.PERatio,
        eps: companyData.EPS,
        revenue: companyData.RevenueTTM,
        profitMargin: companyData.ProfitMargin,
        operatingMargin: companyData.OperatingMarginTTM,
        roe: companyData.ReturnOnEquityTTM,
        beta: companyData.Beta,
        high52Week: companyData['52WeekHigh'],
        low52Week: companyData['52WeekLow'],
        dividendYield: companyData.DividendYield,
      },
      brief: analysis.brief,
      comparables: analysis.comparables,
      newsCount: newsData.length,
      analyzedAt: new Date().toISOString(),
      remaining: newRemaining,
    };

    console.log(`Analysis complete for ${cleanTicker}. User ${user.id} has ${newRemaining} remaining.`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-company function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
