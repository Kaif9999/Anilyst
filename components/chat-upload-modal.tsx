"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  X, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ChatUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (data: any[], metadata: any) => void;
  sessionId: string | null;
}

interface DataSource {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  onClick?: () => void;
}

// PostgreSQL Official Logo Component
const PostgreSQLLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M17.128 0c-1.123 0-2.176.374-3.031 1.104-.855-.73-1.908-1.104-3.031-1.104C7.803 0 5.333 2.17 5.333 4.85c0 .547.088 1.074.25 1.567-.162.493-.25 1.02-.25 1.567 0 2.68 2.47 4.85 5.733 4.85 1.123 0 2.176-.374 3.031-1.104.855.73 1.908 1.104 3.031 1.104 3.263 0 5.733-2.17 5.733-4.85 0-.547-.088-1.074-.25-1.567.162-.493.25-1.02-.25-1.567C22.861 2.17 20.391 0 17.128 0zM7.5 8.5c0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5-2.5-1.119-2.5-2.5zm7 0c0-1.381 1.119-2.5 2.5-2.5s2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5-2.5-1.119-2.5-2.5z"/>
    <path d="M12 13c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z" opacity="0.3"/>
    <circle cx="12" cy="8" r="1.5"/>
  </svg>
);

export default function ChatUploadModal({ 
  isOpen, 
  onClose, 
  onUploadComplete, 
  sessionId
}: ChatUploadModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const dataSources: DataSource[] = [
    {
      id: 'csv-upload',
      name: 'Upload CSV',
      icon: <Upload className="h-3 w-3" />,
      description: 'Upload a CSV file',
      onClick: () => {
        setSelectedSource('csv-upload');
        fileInputRef.current?.click();
      }
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      icon: <PostgreSQLLogo className="h-3 w-3" />,
      description: 'Connect to database',
      onClick: () => {
        toast({
          title: "🚧 Coming Soon!",
          description: "PostgreSQL integration will be available soon",
        });
      }
    }
  ];

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProcessingStep('Validating file...');

    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please upload a CSV file only');
      }

      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      setProcessingStep('Reading file...');
      
      // Read file content
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      setProcessingStep('Parsing CSV...');

      // Parse CSV locally
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        if (values.length === headers.length) {
          const rowData: any = {};
          headers.forEach((header, index) => {
            let value: any = values[index];
            
            // Try to convert to number if possible
            if (value && !isNaN(Number(value)) && value !== '') {
              value = Number(value);
            }
            
            rowData[header] = value;
          });
          data.push(rowData);
        }
      }

      if (data.length === 0) {
        throw new Error('No valid data rows found in CSV file');
      }

      // Create metadata
      const metadata = {
        filename: file.name,
        rowCount: data.length,
        columns: headers,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        dataType: detectDataType(headers, data),
        sessionId: sessionId
      };

      console.log('✅ CSV parsed successfully:', {
        filename: metadata.filename,
        rows: data.length,
        columns: headers.length
      });

      // Return data and close modal
      onUploadComplete(data, metadata);
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setError(errorMessage);
      toast({
        title: "❌ Upload Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const detectDataType = (headers: string[], data: any[]): string => {
    const headerText = headers.join(' ').toLowerCase();
    
    if (headerText.includes('price') || headerText.includes('stock') || headerText.includes('ticker')) {
      return 'Financial/Stock Data';
    } else if (headerText.includes('engagement') || headerText.includes('likes') || headerText.includes('social')) {
      return 'Social Media Data';
    } else if (headerText.includes('sales') || headerText.includes('revenue') || headerText.includes('customer')) {
      return 'Business Data';
    } else if (headerText.includes('temperature') || headerText.includes('weather') || headerText.includes('climate')) {
      return 'Environmental Data';
    } else {
      return 'General Data';
    }
  };

  const handleReset = () => {
    setError(null);
    setSelectedSource(null);
    setProcessingStep('');
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="mt-auto max-w-2xl min-h-[500px] bg-gradient-to-br from-[#0a0b0c] via-[#0f1112] to-[#1a1b1d] backdrop-blur-xl border border-white/10 text-white shadow-2xl rounded-2xl">
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Upload className="h-5 w-5 text-blue-400" />
            </div>
            <span className=" bg-white bg-clip-text text-transparent">
              Add Data Source
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="relative z-10 flex flex-col gap-6 p-2 h-[400px]">
  
          <div >
            {/* Data Sources */}
            {!isProcessing && !error && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <p className="text-base font-medium text-white">Choose your data source</p>
                  <p className="text-sm text-gray-400">Select how you want to import your data for analysis</p>
                </div>
              
                <div className="flex flex-row gap-3 max-w-sm">
                  {dataSources.map((source) => (
                    <Button
                      key={source.id}
                      onClick={source.onClick}
                      variant="outline"
                      size="sm"
                      className="px-3 py-2 h-auto flex rounded-xl items-center justify-start gap-3 border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300 bg-white/5 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10"
                      disabled={isProcessing}
                    >
                      <div className="p-1.5 rounded bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30">
                        {source.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-white text-sm">{source.name}</div>
                        <div className="text-xs text-gray-400 leading-tight">{source.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            )}

            {/* Processing State */}
            {isProcessing && !error && (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
                    <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-white">Processing Your Data</h3>
                  <p className="text-blue-400 text-sm animate-pulse">{processingStep}</p>
                  <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-red-400">Upload Error</h4>
                    <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                  </div>
                  <Button
                    onClick={() => setError(null)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="relative z-10 flex justify-end pt-6 mt-auto border-t border-white/10">
            <Button
              onClick={handleClose}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/10 px-6 py-2 rounded-xl transition-all duration-200 font-medium"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}