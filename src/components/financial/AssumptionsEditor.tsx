import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import type { FinancialAssumptions } from '@/types/financial';

interface AssumptionsEditorProps {
  assumptions: FinancialAssumptions;
  onChange: (assumptions: FinancialAssumptions) => void;
}

export function AssumptionsEditor({ assumptions, onChange }: AssumptionsEditorProps) {
  const handleChange = <K extends keyof FinancialAssumptions>(
    field: K,
    value: FinancialAssumptions[K]
  ) => {
    onChange({ ...assumptions, [field]: value });
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="forecastHorizon">Forecast Horizon (Years)</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Number of years to forecast (typically 5-10)
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="forecastHorizon"
            type="number"
            min={1}
            max={10}
            value={assumptions.forecastHorizon}
            onChange={(e) => handleChange('forecastHorizon', parseInt(e.target.value) || 5)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>WACC</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Weighted Average Cost of Capital - discount rate for DCF
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[assumptions.wacc * 100]}
              onValueChange={([value]) => handleChange('wacc', value / 100)}
              min={5}
              max={20}
              step={0.5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">
              {formatPercent(assumptions.wacc)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Operating Margin</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                EBIT as a percentage of revenue
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[assumptions.operatingMargin * 100]}
              onValueChange={([value]) => handleChange('operatingMargin', value / 100)}
              min={5}
              max={40}
              step={0.5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">
              {formatPercent(assumptions.operatingMargin)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Tax Rate</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Effective corporate tax rate
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[assumptions.taxRate * 100]}
              onValueChange={([value]) => handleChange('taxRate', value / 100)}
              min={10}
              max={40}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">
              {formatPercent(assumptions.taxRate)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Terminal Growth Rate</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Perpetual growth rate for terminal value calculation
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[assumptions.terminalGrowthRate * 100]}
              onValueChange={([value]) => handleChange('terminalGrowthRate', value / 100)}
              min={0}
              max={5}
              step={0.1}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">
              {formatPercent(assumptions.terminalGrowthRate)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>CapEx (% of Revenue)</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Capital expenditure as percentage of revenue
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[assumptions.capexPercent * 100]}
              onValueChange={([value]) => handleChange('capexPercent', value / 100)}
              min={1}
              max={15}
              step={0.5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">
              {formatPercent(assumptions.capexPercent)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Revenue Growth Rates (Year 1-{assumptions.forecastHorizon})</Label>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Annual revenue growth rates for each forecast year
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: assumptions.forecastHorizon }, (_, i) => (
            <div key={i} className="space-y-1">
              <Label className="text-xs text-muted-foreground">Y{i + 1}</Label>
              <Input
                type="number"
                step={0.01}
                min={-0.5}
                max={1}
                value={(assumptions.revenueGrowthRates[i] || 0.05) * 100}
                onChange={(e) => {
                  const newRates = [...assumptions.revenueGrowthRates];
                  newRates[i] = parseFloat(e.target.value) / 100 || 0.05;
                  handleChange('revenueGrowthRates', newRates);
                }}
                className="text-center"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Working Capital Days</Label>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">DSO (Days)</Label>
            <Input
              type="number"
              min={0}
              max={180}
              value={assumptions.wcDays.dso}
              onChange={(e) => handleChange('wcDays', { 
                ...assumptions.wcDays, 
                dso: parseInt(e.target.value) || 45 
              })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">DIO (Days)</Label>
            <Input
              type="number"
              min={0}
              max={180}
              value={assumptions.wcDays.dio}
              onChange={(e) => handleChange('wcDays', { 
                ...assumptions.wcDays, 
                dio: parseInt(e.target.value) || 60 
              })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">DPO (Days)</Label>
            <Input
              type="number"
              min={0}
              max={180}
              value={assumptions.wcDays.dpo}
              onChange={(e) => handleChange('wcDays', { 
                ...assumptions.wcDays, 
                dpo: parseInt(e.target.value) || 30 
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
