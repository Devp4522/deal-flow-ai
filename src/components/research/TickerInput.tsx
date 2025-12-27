import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Lock } from 'lucide-react';
import type { AnalysisStep } from '@/types/research';

interface TickerInputProps {
  onAnalyze: (ticker: string) => void;
  step: AnalysisStep;
  remaining: number | null;
  isAuthenticated: boolean;
}

export function TickerInput({ onAnalyze, step, remaining, isAuthenticated }: TickerInputProps) {
  const [ticker, setTicker] = useState('');
  const navigate = useNavigate();
  
  const isLoading = step === 'fetching' || step === 'analyzing' || step === 'generating';
  const quotaExhausted = remaining !== null && remaining <= 0;
  const canAnalyze = isAuthenticated && !quotaExhausted && ticker.trim() && !isLoading;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (canAnalyze) {
      onAnalyze(ticker);
    }
  };

  const getStepMessage = () => {
    switch (step) {
      case 'fetching':
        return 'Fetching company filings...';
      case 'analyzing':
        return 'Analyzing data with AI...';
      case 'generating':
        return 'Generating report...';
      default:
        return null;
    }
  };

  const stepMessage = getStepMessage();

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Quota Badge */}
      {isAuthenticated && remaining !== null && (
        <div className="flex justify-center">
          <Badge 
            variant={remaining > 0 ? "secondary" : "destructive"}
            className="text-sm px-3 py-1"
          >
            Remaining: {remaining} / 3
          </Badge>
        </div>
      )}

      {/* Auth prompt */}
      {!isAuthenticated && (
        <div className="flex justify-center">
          <Badge variant="outline" className="text-sm px-3 py-1 gap-1.5">
            <Lock className="w-3 h-3" />
            Sign in to generate research briefs
          </Badge>
        </div>
      )}

      {/* Quota exhausted message */}
      {isAuthenticated && quotaExhausted && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <p className="text-destructive text-sm font-medium">
            You've used all 3 research analyses. Contact support for more.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Enter ticker (e.g., AAPL, TSLA)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 5))}
              className="h-12 pl-4 pr-12 text-lg font-mono uppercase tracking-wider"
              disabled={isLoading || quotaExhausted}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <Button 
            type="submit" 
            size="lg" 
            className="h-12 px-6"
            disabled={!ticker.trim() || isLoading || quotaExhausted}
          >
            {!isAuthenticated ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Sign In
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              'Analyze'
            )}
          </Button>
        </div>
        
        {stepMessage && (
          <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{stepMessage}</span>
          </div>
        )}
      </form>
    </div>
  );
}
