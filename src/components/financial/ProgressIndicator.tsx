import { Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  status: string;
  error?: string | null;
}

const steps = [
  { key: 'queued', label: 'Queued' },
  { key: 'parsing', label: 'Parsing Data' },
  { key: 'modelling', label: 'Building Model' },
  { key: 'done', label: 'Complete' },
];

export function ProgressIndicator({ status, error }: ProgressIndicatorProps) {
  const currentIdx = steps.findIndex(s => s.key === status);
  const isFailed = status === 'failed';

  return (
    <div className="py-8">
      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((step, idx) => {
          const isActive = step.key === status;
          const isComplete = currentIdx > idx || status === 'done';
          const isCurrent = currentIdx === idx && !isFailed;

          return (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  isComplete && 'bg-green-500 border-green-500 text-white',
                  isCurrent && 'border-primary bg-primary/10',
                  !isComplete && !isCurrent && 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isComplete ? (
                  <Check className="h-5 w-5" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <span className="text-sm">{idx + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  isComplete && 'text-green-600',
                  isCurrent && 'text-primary',
                  !isComplete && !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'w-8 h-0.5 mx-2',
                    isComplete ? 'bg-green-500' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {isFailed && error && (
        <div className="flex items-center justify-center gap-2 p-4 bg-destructive/10 rounded-lg text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {!isFailed && status !== 'done' && status !== 'idle' && (
        <p className="text-center text-muted-foreground">
          Processing your financial model...
        </p>
      )}
    </div>
  );
}
