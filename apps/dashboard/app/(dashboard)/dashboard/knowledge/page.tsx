'use client';



import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeApi } from '@/lib/api';
import { KnowledgeSource } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Upload,
  Trash2,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  READY: {
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    label: 'Ready',
  },
  PROCESSING: {
    color: 'bg-yellow-100 text-yellow-700',
    icon: Loader2,
    label: 'Processing',
  },
  PENDING: {
    color: 'bg-slate-100 text-slate-700',
    icon: Clock,
    label: 'Pending',
  },
  FAILED: {
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    label: 'Failed',
  },
};

export default function KnowledgePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Fetch knowledge sources
  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['knowledge'],
    queryFn: async () => {
      const res = await knowledgeApi.list();
      return res.data as KnowledgeSource[];
    },
    refetchInterval: (query) => {
      // Auto-refresh if any source is processing
      const data = query.state.data as KnowledgeSource[] | undefined;
      const hasProcessing = (data || []).some(
        (s) => s.status === 'PROCESSING' || s.status === 'PENDING',
      );
      return hasProcessing ? 3000 : false;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success('Deleted successfully');
    },
    onError: () => {
      toast.error('Delete failed');
    },
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

    setUploading(true);
    try {
      await knowledgeApi.upload(formData);
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success('File uploaded! Processing started.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Knowledge Base</h1>
        <p className="text-slate-500 mt-1">
          Upload documents to train your AI chatbot
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Supported formats: PDF, DOCX, TXT (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-slate-600 font-medium">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Upload className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    PDF, DOCX, TXT up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sources List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Knowledge Sources</CardTitle>
            <CardDescription>
              {sources.length} document{sources.length !== 1 ? 's' : ''} in
              your knowledge base
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ['knowledge'] })
            }
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                No documents yet
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Upload your first document above to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => {
                const status =
                  statusConfig[source.status] || statusConfig.PENDING;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {source.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {source.type}
                          </Badge>
                          {source.chunkCount > 0 && (
                            <span className="text-xs text-slate-400">
                              {source.chunkCount} chunks
                            </span>
                          )}
                          {source.errorMsg && (
                            <span className="text-xs text-red-500 max-w-xs truncate">
                              {source.errorMsg}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}
                      >
                        <StatusIcon
                          className={`w-3 h-3 ${source.status === 'PROCESSING' ? 'animate-spin' : ''}`}
                        />
                        {status.label}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(source.id)}
                        disabled={deleteMutation.isPending}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}