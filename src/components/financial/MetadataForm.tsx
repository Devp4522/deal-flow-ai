import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CompanyMetadata } from '@/types/financial';

interface MetadataFormProps {
  metadata: CompanyMetadata;
  onChange: (metadata: CompanyMetadata) => void;
}

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'CAD', 'AUD'];

const fiscalYearEnds = [
  { value: '12-31', label: 'December 31' },
  { value: '03-31', label: 'March 31' },
  { value: '06-30', label: 'June 30' },
  { value: '09-30', label: 'September 30' },
];

export function MetadataForm({ metadata, onChange }: MetadataFormProps) {
  const handleChange = (field: keyof CompanyMetadata, value: string) => {
    onChange({ ...metadata, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ticker">Ticker Symbol *</Label>
          <Input
            id="ticker"
            value={metadata.ticker}
            onChange={(e) => handleChange('ticker', e.target.value.toUpperCase())}
            placeholder="AAPL"
            maxLength={10}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={metadata.companyName || ''}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Apple Inc."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fiscalYearEnd">Fiscal Year End *</Label>
          <Select
            value={metadata.fiscalYearEnd}
            onValueChange={(value) => handleChange('fiscalYearEnd', value)}
          >
            <SelectTrigger id="fiscalYearEnd">
              <SelectValue placeholder="Select fiscal year end" />
            </SelectTrigger>
            <SelectContent>
              {fiscalYearEnds.map((fye) => (
                <SelectItem key={fye.value} value={fye.value}>
                  {fye.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={metadata.currency}
            onValueChange={(value) => handleChange('currency', value)}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
