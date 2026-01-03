import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNegotiation } from '@/hooks/useNegotiation';
import { InputPanel } from '@/components/negotiation/InputPanel';
import { ScenarioBuilder } from '@/components/negotiation/ScenarioBuilder';
import { OfferCards } from '@/components/negotiation/OfferCards';
import { PlaybookPanel } from '@/components/negotiation/Playbook';
import { ApprovalPanel } from '@/components/negotiation/ApprovalPanel';
import { HistoryPanel } from '@/components/negotiation/HistoryPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Handshake, AlertTriangle, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { NegotiationInputs, NegotiationRevision, NegotiationApproval, Negotiation } from '@/types/negotiation';

export default function NegotiationPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    isLoading,
    results,
    negotiations,
    createOrUpdate,
    generate,
    approve,
    getHistory,
    listNegotiations,
    setResults,
  } = useNegotiation();

  const [activeTab, setActiveTab] = useState('input');
  const [currentNegotiationId, setCurrentNegotiationId] = useState<string | null>(null);
  const [currentInputs, setCurrentInputs] = useState<NegotiationInputs | null>(null);
  const [history, setHistory] = useState<{
    revisions: NegotiationRevision[];
    approvals: NegotiationApproval[];
  }>({ revisions: [], approvals: [] });
  const [currentNegotiation, setCurrentNegotiation] = useState<Negotiation | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/negotiation');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      listNegotiations();
    }
  }, [user]);

  const handleInputSubmit = async (inputs: NegotiationInputs) => {
    setCurrentInputs(inputs);
    
    const result = await createOrUpdate(
      inputs,
      { name: inputs.target_company, ticker: inputs.ticker },
      currentNegotiationId || undefined
    );
    
    if (result?.negotiation_id) {
      setCurrentNegotiationId(result.negotiation_id);
      setActiveTab('build');
    }
  };

  const handleGenerate = async () => {
    if (!currentNegotiationId || !currentInputs) return;

    const generatedResults = await generate(currentNegotiationId, currentInputs);
    
    if (generatedResults) {
      // Refresh history
      const historyData = await getHistory(currentNegotiationId);
      setHistory(historyData);
      
      // Update current negotiation state
      const negs = await listNegotiations();
      const current = negs.find((n: Negotiation) => n.id === currentNegotiationId);
      if (current) {
        setCurrentNegotiation(current);
      }
      
      setActiveTab('offers');
    }
  };

  const handleApprove = async (approved: boolean, reason: string) => {
    if (!currentNegotiationId || !currentNegotiation) return;
    
    await approve(currentNegotiationId, currentNegotiation.current_revision, approved, reason);
    
    // Refresh history
    const historyData = await getHistory(currentNegotiationId);
    setHistory(historyData);
    
    // Refresh negotiations list
    const negs = await listNegotiations();
    const current = negs.find((n: Negotiation) => n.id === currentNegotiationId);
    if (current) {
      setCurrentNegotiation(current);
    }
  };

  const handleSelectNegotiation = async (negotiation: Negotiation) => {
    setCurrentNegotiationId(negotiation.id);
    setCurrentNegotiation(negotiation);
    
    // Load history
    const historyData = await getHistory(negotiation.id);
    setHistory(historyData);
    
    // Load latest revision inputs
    if (historyData.revisions.length > 0) {
      const latestRevision = historyData.revisions[0];
      if (latestRevision.inputs) {
        setCurrentInputs(latestRevision.inputs);
      }
      if (latestRevision.results) {
        setResults(latestRevision.results);
        setActiveTab('offers');
      }
    }
  };

  const handleNewNegotiation = () => {
    setCurrentNegotiationId(null);
    setCurrentNegotiation(null);
    setCurrentInputs(null);
    setResults(null);
    setHistory({ revisions: [], approvals: [] });
    setActiveTab('input');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Handshake className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold">Negotiation Agent</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleNewNegotiation}>
                <Plus className="w-4 h-4 mr-2" />
                New Negotiation
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Negotiations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Your Negotiations</h3>
                {negotiations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No negotiations yet.</p>
                ) : (
                  <div className="space-y-2">
                    {negotiations.map((neg) => (
                      <button
                        key={neg.id}
                        onClick={() => handleSelectNegotiation(neg)}
                        className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${
                          currentNegotiationId === neg.id
                            ? 'bg-primary/10 border border-primary'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <p className="font-medium truncate">
                          {neg.company?.name || 'Unnamed Deal'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rev {neg.current_revision} • {neg.state}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="input">Deal Inputs</TabsTrigger>
                <TabsTrigger value="build" disabled={!currentNegotiationId}>
                  Scenario Builder
                </TabsTrigger>
                <TabsTrigger value="offers" disabled={!results}>
                  Offers
                </TabsTrigger>
                <TabsTrigger value="playbook" disabled={!results}>
                  Playbook
                </TabsTrigger>
                <TabsTrigger value="approvals" disabled={!results}>
                  Approvals
                </TabsTrigger>
                <TabsTrigger value="history" disabled={!currentNegotiationId}>
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="input" className="space-y-4">
                <InputPanel
                  onSubmit={handleInputSubmit}
                  isLoading={isLoading}
                  initialInputs={currentInputs || undefined}
                />
              </TabsContent>

              <TabsContent value="build" className="space-y-4">
                <ScenarioBuilder
                  sellerAsk={currentInputs?.seller_ask_price || 100000000}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                />
              </TabsContent>

              <TabsContent value="offers" className="space-y-4">
                {results?.requires_approval && (
                  <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">
                      This revision requires approval due to high-risk scenarios. Review and approve in the Approvals tab.
                    </span>
                  </div>
                )}
                {results?.offers && <OfferCards offers={results.offers} />}
              </TabsContent>

              <TabsContent value="playbook" className="space-y-4">
                {results && (
                  <PlaybookPanel
                    playbook={results.playbook}
                    zopa={results.zopa}
                    batna={results.batna}
                    memo={results.memo}
                    draftLoi={results.draft_loi}
                  />
                )}
              </TabsContent>

              <TabsContent value="approvals" className="space-y-4">
                {currentNegotiation && (
                  <ApprovalPanel
                    negotiationId={currentNegotiationId!}
                    currentRevision={currentNegotiation.current_revision}
                    state={currentNegotiation.state}
                    requiresApproval={results?.requires_approval || false}
                    approvals={history.approvals}
                    onApprove={handleApprove}
                    isLoading={isLoading}
                  />
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <HistoryPanel
                  revisions={history.revisions}
                  approvals={history.approvals}
                  currentRevision={currentNegotiation?.current_revision || 0}
                  onSelectRevision={(revision) => {
                    if (revision.results) {
                      setResults(revision.results);
                      setActiveTab('offers');
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
