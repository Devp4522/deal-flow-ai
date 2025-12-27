import { Download, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { FinancialModelResult } from '@/types/financial';

interface ResultsPanelProps {
  result: FinancialModelResult;
  onReset: () => void;
}

export function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.provenance.ticker}_dcf_model.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* DCF Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              DCF Valuation Summary
            </CardTitle>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
              Completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Enterprise Value</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(result.dcf.enterpriseValue)}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Terminal Value</p>
              <p className="text-xl font-semibold">
                {formatCurrency(result.dcf.terminalValue)}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">WACC</p>
              <p className="text-xl font-semibold">
                {formatPercent(result.dcf.wacc)}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Terminal Growth</p>
              <p className="text-xl font-semibold">
                {formatPercent(result.assumptions.terminalGrowthRate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {result.checks.warnings.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Model Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-1">
              {result.checks.warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-yellow-700">{warning}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Sensitivity Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sensitivity Analysis (WACC vs Terminal Growth)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">WACC \ TGR</TableHead>
                  {result.dcf.sensitivityMatrix[0]?.map((cell, idx) => (
                    <TableHead key={idx} className="text-center">
                      {formatPercent(cell.tgr)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.dcf.sensitivityMatrix.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    <TableCell className="font-medium">
                      {formatPercent(row[0].wacc)}
                    </TableCell>
                    {row.map((cell, colIdx) => (
                      <TableCell 
                        key={colIdx} 
                        className={`text-center ${
                          rowIdx === 1 && colIdx === 1 
                            ? 'bg-primary/10 font-semibold' 
                            : ''
                        }`}
                      >
                        {formatCurrency(cell.ev)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Forecasted Income */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Forecasted Income Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Gross Profit</TableHead>
                  <TableHead className="text-right">EBITDA</TableHead>
                  <TableHead className="text-right">Net Income</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.forecasted_income.map((row) => (
                  <TableRow key={row.period}>
                    <TableCell className="font-medium">{row.period}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.revenue || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.grossProfit || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.ebitda || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.netIncome || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={downloadJSON} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download JSON
        </Button>
        <Button variant="outline" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          New Model
        </Button>
      </div>

      {/* Provenance */}
      <div className="text-xs text-muted-foreground text-center pt-4 border-t">
        Generated for {result.provenance.ticker} 
        {result.provenance.company_name && ` (${result.provenance.company_name})`}
        {' · '}{new Date(result.provenance.generated_at).toLocaleString()}
        {' · '}Agent {result.provenance.agent_version}
      </div>
    </div>
  );
}
