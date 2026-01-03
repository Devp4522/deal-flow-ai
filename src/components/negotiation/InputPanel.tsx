import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { NegotiationInputs } from '@/types/negotiation';

interface InputPanelProps {
  onSubmit: (inputs: NegotiationInputs) => void;
  isLoading: boolean;
  initialInputs?: Partial<NegotiationInputs>;
}

const MUST_HAVE_OPTIONS = [
  'Non-compete',
  'Key employee retention',
  'IP assignment',
  'Customer contracts',
  'Regulatory approvals',
  'Working capital peg',
  'Rep & warranty insurance',
  'Escrow holdback',
];

export function InputPanel({ onSubmit, isLoading, initialInputs }: InputPanelProps) {
  const [inputs, setInputs] = useState<Partial<NegotiationInputs>>({
    target_company: '',
    seller_ask_price: 0,
    acceptable_price_range: [0, 0],
    maximum_cash_at_close: 0,
    desired_close_date: '',
    must_have_terms: [],
    competing_bidders: 'unknown',
    certainty_priority: 5,
    earnout_preferences: { metric: 'EBITDA', period: '2y' },
    escrow_preferences: { percentage: 10, duration_months: 18 },
    working_capital_adjustment: 'peg + true-up',
    ...initialInputs,
  });

  const [closeDate, setCloseDate] = useState<Date | undefined>(
    initialInputs?.desired_close_date ? new Date(initialInputs.desired_close_date) : undefined
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.target_company || !inputs.seller_ask_price) {
      return;
    }
    onSubmit(inputs as NegotiationInputs);
  };

  const toggleMustHave = (term: string) => {
    const current = inputs.must_have_terms || [];
    if (current.includes(term)) {
      setInputs({ ...inputs, must_have_terms: current.filter((t) => t !== term) });
    } else {
      setInputs({ ...inputs, must_have_terms: [...current, term] });
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span>Deal Inputs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Company */}
          <div className="space-y-2">
            <Label htmlFor="target_company">Target Company</Label>
            <Input
              id="target_company"
              placeholder="Enter company name or ticker"
              value={inputs.target_company || ''}
              onChange={(e) => setInputs({ ...inputs, target_company: e.target.value, company_name: e.target.value })}
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Import from Research
              </Button>
            </div>
          </div>

          {/* Seller Ask Price */}
          <div className="space-y-2">
            <Label htmlFor="seller_ask_price">Seller Ask Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="seller_ask_price"
                type="number"
                className="pl-7"
                placeholder="100,000,000"
                value={inputs.seller_ask_price || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setInputs({
                    ...inputs,
                    seller_ask_price: value,
                    acceptable_price_range: [value * 0.85, value * 1.05],
                    maximum_cash_at_close: value,
                  });
                }}
              />
            </div>
            {inputs.seller_ask_price ? (
              <p className="text-xs text-muted-foreground">{formatCurrency(inputs.seller_ask_price)}</p>
            ) : null}
          </div>

          {/* Acceptable Price Range */}
          <div className="space-y-2">
            <Label>Acceptable Price Range</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={inputs.acceptable_price_range?.[0] || ''}
                onChange={(e) => setInputs({
                  ...inputs,
                  acceptable_price_range: [parseFloat(e.target.value) || 0, inputs.acceptable_price_range?.[1] || 0],
                })}
                className="text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={inputs.acceptable_price_range?.[1] || ''}
                onChange={(e) => setInputs({
                  ...inputs,
                  acceptable_price_range: [inputs.acceptable_price_range?.[0] || 0, parseFloat(e.target.value) || 0],
                })}
                className="text-sm"
              />
            </div>
            {inputs.acceptable_price_range?.[0] && inputs.acceptable_price_range?.[1] ? (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(inputs.acceptable_price_range[0])} – {formatCurrency(inputs.acceptable_price_range[1])}
              </p>
            ) : null}
          </div>

          {/* Maximum Cash at Close */}
          <div className="space-y-2">
            <Label htmlFor="max_cash">Maximum Cash at Close</Label>
            <Input
              id="max_cash"
              type="number"
              value={inputs.maximum_cash_at_close || ''}
              onChange={(e) => setInputs({ ...inputs, maximum_cash_at_close: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Desired Close Date */}
          <div className="space-y-2">
            <Label>Desired Close Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {closeDate ? format(closeDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={closeDate}
                  onSelect={(date) => {
                    setCloseDate(date);
                    setInputs({ ...inputs, desired_close_date: date?.toISOString() || '' });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Must-Have Terms */}
          <div className="space-y-2">
            <Label>Must-Have Terms</Label>
            <div className="flex flex-wrap gap-2">
              {MUST_HAVE_OPTIONS.map((term) => (
                <Badge
                  key={term}
                  variant={inputs.must_have_terms?.includes(term) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleMustHave(term)}
                >
                  {term}
                  {inputs.must_have_terms?.includes(term) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Competing Bidders */}
          <div className="space-y-2">
            <Label>Competing Bidders</Label>
            <Select
              value={inputs.competing_bidders}
              onValueChange={(value: 'yes' | 'no' | 'unknown') => setInputs({ ...inputs, competing_bidders: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Certainty Priority */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Certainty Priority</Label>
              <span className="text-sm text-muted-foreground">{inputs.certainty_priority}/10</span>
            </div>
            <Slider
              value={[inputs.certainty_priority || 5]}
              onValueChange={([value]) => setInputs({ ...inputs, certainty_priority: value })}
              max={10}
              min={0}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Price-focused</span>
              <span>Certainty-focused</span>
            </div>
          </div>

          {/* Earnout Preferences */}
          <div className="space-y-2">
            <Label>Earnout Preferences</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={inputs.earnout_preferences?.metric || 'EBITDA'}
                onValueChange={(value) => setInputs({
                  ...inputs,
                  earnout_preferences: { ...inputs.earnout_preferences!, metric: value },
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EBITDA">EBITDA</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Gross Profit">Gross Profit</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={inputs.earnout_preferences?.period || '2y'}
                onValueChange={(value) => setInputs({
                  ...inputs,
                  earnout_preferences: { ...inputs.earnout_preferences!, period: value },
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="2y">2 Years</SelectItem>
                  <SelectItem value="3y">3 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Escrow Preferences */}
          <div className="space-y-2">
            <Label>Escrow Preferences</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Percentage</span>
                <Input
                  type="number"
                  value={inputs.escrow_preferences?.percentage || 10}
                  onChange={(e) => setInputs({
                    ...inputs,
                    escrow_preferences: { ...inputs.escrow_preferences!, percentage: parseFloat(e.target.value) || 10 },
                  })}
                  min={0}
                  max={25}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Duration (months)</span>
                <Input
                  type="number"
                  value={inputs.escrow_preferences?.duration_months || 18}
                  onChange={(e) => setInputs({
                    ...inputs,
                    escrow_preferences: { ...inputs.escrow_preferences!, duration_months: parseInt(e.target.value) || 18 },
                  })}
                  min={6}
                  max={36}
                />
              </div>
            </div>
          </div>

          {/* Working Capital */}
          <div className="space-y-2">
            <Label>Working Capital Adjustment</Label>
            <Select
              value={inputs.working_capital_adjustment || 'peg + true-up'}
              onValueChange={(value) => setInputs({ ...inputs, working_capital_adjustment: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peg + true-up">Peg + True-up</SelectItem>
                <SelectItem value="collar">Collar (+/- 5%)</SelectItem>
                <SelectItem value="locked box">Locked Box</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !inputs.target_company}>
            {isLoading ? 'Processing...' : 'Save & Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
