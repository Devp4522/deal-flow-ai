import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

interface ScenarioBuilderProps {
  sellerAsk: number;
  onGenerate: (overrides: ScenarioOverrides) => void;
  isLoading: boolean;
}

export interface ScenarioOverrides {
  price_multiplier: number;
  cash_percent: number;
  escrow_percent: number;
  closing_weeks: number;
}

export function ScenarioBuilder({ sellerAsk, onGenerate, isLoading }: ScenarioBuilderProps) {
  const [overrides, setOverrides] = useState<ScenarioOverrides>({
    price_multiplier: 1.0,
    cash_percent: 75,
    escrow_percent: 10,
    closing_weeks: 8,
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const estimatedPrice = sellerAsk * overrides.price_multiplier;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Scenario Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Slider */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Offer Price</Label>
            <span className="text-sm font-medium">
              {formatCurrency(estimatedPrice)} ({Math.round(overrides.price_multiplier * 100)}% of ask)
            </span>
          </div>
          <Slider
            value={[overrides.price_multiplier * 100]}
            onValueChange={([value]) => setOverrides({ ...overrides, price_multiplier: value / 100 })}
            min={80}
            max={110}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>80%</span>
            <span>100%</span>
            <span>110%</span>
          </div>
        </div>

        {/* Cash vs Earnout */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Cash at Close</Label>
            <span className="text-sm font-medium">{overrides.cash_percent}%</span>
          </div>
          <Slider
            value={[overrides.cash_percent]}
            onValueChange={([value]) => setOverrides({ ...overrides, cash_percent: value })}
            min={50}
            max={100}
            step={5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50% (More Earnout)</span>
            <span>100% (All Cash)</span>
          </div>
        </div>

        {/* Escrow */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Escrow Holdback</Label>
            <span className="text-sm font-medium">{overrides.escrow_percent}%</span>
          </div>
          <Slider
            value={[overrides.escrow_percent]}
            onValueChange={([value]) => setOverrides({ ...overrides, escrow_percent: value })}
            min={0}
            max={20}
            step={1}
          />
        </div>

        {/* Closing Timeline */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Closing Timeline</Label>
            <span className="text-sm font-medium">{overrides.closing_weeks} weeks</span>
          </div>
          <Slider
            value={[overrides.closing_weeks]}
            onValueChange={([value]) => setOverrides({ ...overrides, closing_weeks: value })}
            min={4}
            max={16}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4 weeks (Fast)</span>
            <span>16 weeks</span>
          </div>
        </div>

        <Button 
          onClick={() => onGenerate(overrides)} 
          className="w-full"
          disabled={isLoading}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? 'Generating Scenarios...' : 'Generate Offer Scenarios'}
        </Button>
      </CardContent>
    </Card>
  );
}
