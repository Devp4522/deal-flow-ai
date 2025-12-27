import { useState, useCallback } from 'react';
import { Upload, File, X, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileContent: (content: string) => void;
  className?: string;
}

export function FileUpload({ onFileContent, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setError(null);
    
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const isCSV = file.name.endsWith('.csv') || validTypes.includes(file.type);
    
    if (!isCSV) {
      setError('Please upload a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      const content = await file.text();
      setFile(file);
      onFileContent(content);
    } catch (err) {
      setError('Failed to read file');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    onFileContent('');
  };

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50',
          file && 'border-green-500/50 bg-green-500/5'
        )}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="ml-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground font-medium mb-1">
              Drag and drop your CSV file here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Required CSV Format</h4>
        <p className="text-xs text-muted-foreground mb-2">
          Your CSV should include columns like:
        </p>
        <code className="text-xs bg-background px-2 py-1 rounded block overflow-x-auto">
          period, revenue, cogs, gross_profit, opex, depreciation, interest, tax, net_income
        </code>
      </div>
    </div>
  );
}
