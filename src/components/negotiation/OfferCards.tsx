import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import type { OfferScenario } from '@/types/negotiation';

interface OfferCardsProps {
  offers: OfferScenario[];
}

export function OfferCards({ offers }: OfferCardsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const getAcceptanceColor = (prob: number) => {
    if (prob >= 0.7) return 'text-green-600';
    if (prob >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAcceptanceLabel = (prob: number) => {
    if (prob >= 0.7) return 'High';
    if (prob >= 0.5) return 'Medium';
    return 'Low';
  };

  const getLabelVariant = (label: string) => {
    switch (label) {
      case 'Aggressive': return 'destructive';
      case 'Balanced': return 'default';
      case 'Defensive': return 'secondary';
      case 'Maximum Certainty': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {offers.map((offer, index) => (
        <Card key={index} className="relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            offer.label === 'Aggressive' ? 'bg-red-500' :
            offer.label === 'Balanced' ? 'bg-primary' :
            offer.label === 'Defensive' ? 'bg-blue-500' :
            'bg-green-500'
          }`} />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {offer.label === 'Aggressive' && <TrendingDown className="w-4 h-4 text-red-500" />}
                {offer.label === 'Balanced' && <TrendingUp className="w-4 h-4 text-primary" />}
                {offer.label === 'Defensive' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                {offer.label === 'Maximum Certainty' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {offer.label}
              </CardTitle>
              <Badge variant={getLabelVariant(offer.label)}>
                {Math.round(offer.accept_prob * 100)}% likely
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price */}
            <div>
              <p className="text-2xl font-bold">{formatCurrency(offer.equity_value)}</p>
              <p className="text-sm text-muted-foreground">Equity Value</p>
            </div>

            {/* Key Terms */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Cash at Close</p>
                <p className="font-medium">{formatCurrency(offer.cash_at_close)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Escrow</p>
                <p className="font-medium">{offer.escrow_pct}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Earnout Cap</p>
                <p className="font-medium">{formatCurrency(offer.earnout_terms.cap)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Close Timeline</p>
                <p className="font-medium">{offer.closing_days} days</p>
              </div>
            </div>

            {/* Acceptance Probability */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acceptance Probability</span>
                <span className={`font-medium ${getAcceptanceColor(offer.accept_prob)}`}>
                  {getAcceptanceLabel(offer.accept_prob)}
                </span>
              </div>
              <Progress value={offer.accept_prob * 100} className="h-2" />
            </div>

            {/* Risk Flags */}
            {offer.risk_flags.length > 0 && (
              <div className="space-y-1">
                {offer.risk_flags.map((flag, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Details Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Info className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{offer.label} Scenario Details</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Pricing Structure</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Equity Value</span>
                        <span>{formatCurrency(offer.equity_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash at Close</span>
                        <span>{formatCurrency(offer.cash_at_close)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Earnout</span>
                        <span>Up to {formatCurrency(offer.earnout_terms.cap)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Earnout Terms</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Metric</span>
                        <span>{offer.earnout_terms.metric}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Period</span>
                        <span>{offer.earnout_terms.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cap</span>
                        <span>{formatCurrency(offer.earnout_terms.cap)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Other Terms</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Escrow</span>
                        <span>{offer.escrow_pct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Working Capital</span>
                        <span>{offer.working_capital}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Closing Timeline</span>
                        <span>{offer.closing_days} days</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Rationale</h4>
                    <p className="text-sm text-muted-foreground">{offer.rationale}</p>
                  </div>

                  {offer.risk_flags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Risk Flags</h4>
                      <ul className="space-y-1">
                        {offer.risk_flags.map((flag, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-amber-600">
                            <AlertTriangle className="w-3 h-3" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
