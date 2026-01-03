import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { NegotiationRevision, NegotiationApproval } from '@/types/negotiation';

interface HistoryPanelProps {
  revisions: NegotiationRevision[];
  approvals: NegotiationApproval[];
  currentRevision: number;
  onSelectRevision?: (revision: NegotiationRevision) => void;
}

export function HistoryPanel({ revisions, approvals, currentRevision, onSelectRevision }: HistoryPanelProps) {
  const getApprovalForRevision = (rev: number) => {
    return approvals.find((a) => a.revision === rev);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Revision History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {revisions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No revisions yet. Generate scenarios to create the first revision.
              </p>
            ) : (
              revisions.map((revision) => {
                const approval = getApprovalForRevision(revision.revision);
                const isCurrent = revision.revision === currentRevision;

                return (
                  <div
                    key={revision.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                      isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => onSelectRevision?.(revision)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Revision {revision.revision}</span>
                        {isCurrent && (
                          <Badge variant="outline" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(revision.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Risk flags summary */}
                    {revision.risk_flags && revision.risk_flags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {revision.risk_flags.slice(0, 2).map((flag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {flag.length > 25 ? flag.slice(0, 25) + '...' : flag}
                          </Badge>
                        ))}
                        {revision.risk_flags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{revision.risk_flags.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Approval status */}
                    {approval && (
                      <div className={`flex items-center gap-2 text-xs ${
                        approval.decision === 'approved' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {approval.decision === 'approved' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>
                          {approval.decision === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                          {new Date(approval.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Results summary */}
                    {revision.results && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {revision.results.offers?.length || 0} scenarios generated
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
