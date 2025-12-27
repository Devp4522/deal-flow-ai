import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useFinancialModel } from '@/hooks/useFinancialModel';
import { FileUpload } from '@/components/financial/FileUpload';
import { MetadataForm } from '@/components/financial/MetadataForm';
import { AssumptionsEditor } from '@/components/financial/AssumptionsEditor';
import { ResultsPanel } from '@/components/financial/ResultsPanel';
import { ProgressIndicator } from '@/components/financial/ProgressIndicator';
import { DEFAULT_ASSUMPTIONS, type CompanyMetadata, type FinancialAssumptions } from '@/types/financial';

export default function FinancialAgent() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isProcessing, status, result, error, startModel, reset } = useFinancialModel();

  const [csvContent, setCsvContent] = useState('');
  const [metadata, setMetadata] = useState<CompanyMetadata>({
    ticker: '',
    companyName: '',
    fiscalYearEnd: '12-31',
    currency: 'USD',
  });
  const [assumptions, setAssumptions] = useState<FinancialAssumptions>(DEFAULT_ASSUMPTIONS);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/financial-agent');
    }
  }, [user, authLoading, navigate]);

  const canSubmit = csvContent && metadata.ticker && !isProcessing;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await startModel({
      ticker: metadata.ticker,
      companyName: metadata.companyName,
      fiscalYearEnd: metadata.fiscalYearEnd,
      currency: metadata.currency,
      assumptions,
      csvContent,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Financial Modelling Agent</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {result ? (
          <ResultsPanel result={result} onReset={reset} />
        ) : isProcessing || (status !== 'idle' && status !== 'failed') ? (
          <Card>
            <CardContent className="pt-6">
              <ProgressIndicator status={status} error={error} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Financial Data</CardTitle>
                  <CardDescription>
                    Upload historical income statement, balance sheet, or cash flow data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onFileContent={setCsvContent} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetadataForm metadata={metadata} onChange={setMetadata} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Assumptions</CardTitle>
                  <CardDescription>
                    Configure forecast assumptions for DCF valuation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="growth">
                    <TabsList className="mb-4">
                      <TabsTrigger value="growth">Growth & Margins</TabsTrigger>
                      <TabsTrigger value="valuation">Valuation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="growth">
                      <AssumptionsEditor assumptions={assumptions} onChange={setAssumptions} />
                    </TabsContent>
                    <TabsContent value="valuation">
                      <AssumptionsEditor assumptions={assumptions} onChange={setAssumptions} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Button
                size="lg"
                className="w-full"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                <Calculator className="mr-2 h-5 w-5" />
                Generate Model
              </Button>

              {error && status === 'failed' && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
