"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  X, 
  AlertCircle,
  Database,
  Loader2,
  FolderOpen,
  Globe,
  Cloud,
  Link,
  FileSpreadsheet
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
  comingSoon?: boolean;
  onClick?: () => void;
}

export default function ChatUploadModal({ 
  isOpen, 
  onClose, 
  onUploadComplete, 
  sessionId
}: ChatUploadModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Define data sources
  const dataSources: DataSource[] = [
    {
      id: 'csv-upload',
      name: 'Upload CSV',
      icon: <Upload className="h-4 w-4" />,
      description: 'Upload a CSV file from your computer',
      onClick: () => {
        setSelectedSource('csv-upload');
        fileInputRef.current?.click();
      }
    },
    {
      id: 'google-sheets',
      name: 'Google Sheets',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      description: 'Import data from Google Sheets',
      comingSoon: true,
      onClick: () => {
        toast({
          title: "🚧 Coming Soon!",
          description: "Google Sheets integration will be available soon",
        });
      }
    },
    {
      id: 'url-import',
      name: 'From URL',
      icon: <Link className="h-4 w-4" />,
      description: 'Import CSV data from a URL',
      comingSoon: true,
      onClick: () => {
        toast({
          title: "🚧 Coming Soon!",
          description: "URL import will be available soon",
        });
      }
    },
    {
      id: 'cloud-storage',
      name: 'Cloud Storage',
      icon: <Cloud className="h-4 w-4" />,
      description: 'Import from Dropbox, OneDrive, etc.',
      comingSoon: true,
      onClick: () => {
        toast({
          title: "🚧 Coming Soon!",
          description: "Cloud storage integration will be available soon",
        });
      }
    },
    {
      id: 'api-data',
      name: 'API Data',
      icon: <Globe className="h-4 w-4" />,
      description: 'Connect to external APIs',
      comingSoon: true,
      onClick: () => {
        toast({
          title: "🚧 Coming Soon!",
          description: "API data integration will be available soon",
        });
      }
    },
    {
      id: 'sample-data',
      name: 'Sample Data',
      icon: <Database className="h-4 w-4" />,
      description: 'Use sample datasets for testing',
      comingSoon: true,
      onClick: () => {
        toast({
          title: "🚧 Coming Soon!",
          description: "Sample datasets will be available soon",
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
      // ✅ 1. Validate file type - NO AI
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Please upload a CSV file only');
      }

      // ✅ 2. Validate file size - NO AI
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      setProcessingStep('Reading file...');
      
      // ✅ 3. Read file content - NO AI
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      setProcessingStep('Parsing CSV...');

      // ✅ 4. Parse CSV locally - NO AI, NO backend calls
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

      // ✅ 5. Create metadata - NO AI
      const metadata = {
        filename: file.name,
        rowCount: data.length,
        columns: headers,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        dataType: detectDataType(headers, data), // Simple string matching
        sessionId: sessionId
      };

      console.log('✅ CSV parsed successfully:', {
        filename: metadata.filename,
        rows: data.length,
        columns: headers.length
      });

      // ✅ 6. Return data and close modal - NO AI processing
      onUploadComplete(data, metadata);
      handleClose(); // Modal closes immediately
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setSelectedSource('csv-upload');
    handleFileSelect(e.dataTransfer.files);
  };

  const handleReset = () => {
    setError(null);
    setSelectedSource(null);
    setIsDragOver(false);
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
      <DialogContent className="max-w-4xl max-h-[90vh] bg-black/95 backdrop-blur-xl border-white/20 text-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            Add Data Source
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[75vh] pr-2">
          {/* Data Sources Grid */}
          {!isProcessing && !error && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Choose Data Source</h3>
                <span className="text-sm text-gray-400">Select how you want to import your data</span>
              </div>
              
              {/* Data Sources Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dataSources.map((source) => (
                  <Button
                    key={source.id}
                    onClick={source.onClick}
                    variant="outline"
                    className={`h-auto p-4 flex flex-col items-center gap-3 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 relative ${
                      selectedSource === source.id ? 'border-blue-400 bg-blue-500/10' : ''
                    } ${source.comingSoon ? 'opacity-60' : ''}`}
                    disabled={isProcessing}
                  >
                    {/* Coming Soon Badge */}
                    {source.comingSoon && (
                      <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        Soon
                      </div>
                    )}
                    
                    <div className={`p-3 rounded-lg ${
                      selectedSource === source.id 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-white/10 text-gray-400'
                    }`}>
                      {source.icon}
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium text-white text-sm">{source.name}</div>
                      <div className="text-xs text-gray-400 mt-1 leading-tight">
                        {source.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Hidden file input for CSV upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-500/10' 
                    : 'border-white/20 hover:border-white/30 hover:bg-white/5'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-3">
                  <FolderOpen className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-300">Or drag and drop your CSV file here</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max 10MB • Data will be available in this chat only
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Processing State - Only shown while parsing */}
          {isProcessing && !error && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-medium text-white">Loading Your Data</h3>
                <p className="text-blue-400 font-medium">{processingStep}</p>
                <p className="text-gray-400 text-sm">
                  Parsing your CSV file...
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-red-400">Upload Error</h4>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
              <Button
                onClick={() => setError(null)}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 p-1 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div className="text-sm text-gray-400">
            {isProcessing ? (
              '🔄 Parsing your file...'
            ) : error ? (
              '❌ Upload failed'
            ) : (
              'Select a data source to get started'
            )}
          </div>
          
          <Button
            onClick={handleClose}
            variant="ghost"
            className="text-gray-400 hover:text-white"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}