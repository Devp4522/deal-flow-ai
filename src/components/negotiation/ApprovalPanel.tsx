import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import type { NegotiationApproval } from '@/types/negotiation';

interface ApprovalPanelProps {
  negotiationId: string;
  currentRevision: number;
  state: string;
  requiresApproval: boolean;
  approvals: NegotiationApproval[];
  onApprove: (approved: boolean, reason: string) => Promise<void>;
  isLoading: boolean;
}

export function ApprovalPanel({
  negotiationId,
  currentRevision,
  state,
  requiresApproval,
  approvals,
  onApprove,
  isLoading,
}: ApprovalPanelProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (approved: boolean) => {
    if (!reason.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onApprove(approved, reason);
      setReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStateColor = (s: string) => {
    switch (s) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-amber-100 text-amber-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Approvals
          </CardTitle>
          <Badge className={getStateColor(state)}>
            {state === 'pending_approval' ? 'Pending Approval' : state.charAt(0).toUpperCase() + state.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {requiresApproval && state === 'pending_approval' && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Approval Required</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This revision contains high-risk scenarios or is outside fair value tolerance. Approval is required before proceeding.
            </p>
            <Textarea
              placeholder="Enter reason for approval or rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mb-3"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting || !reason.trim()}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || !reason.trim()}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {state === 'approved' && (
          <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Revision {currentRevision} Approved</span>
            </div>
          </div>
        )}

        {/* Approval History */}
        {approvals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Approval History</h4>
            <div className="space-y-2">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className={`p-3 rounded-lg text-sm ${
                    approval.decision === 'approved'
                      ? 'bg-green-50 dark:bg-green-950/30'
                      : 'bg-red-50 dark:bg-red-950/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {approval.decision === 'approved' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="font-medium">
                        Revision {approval.revision} {approval.decision}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(approval.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground ml-6">{approval.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
