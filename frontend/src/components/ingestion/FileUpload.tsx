import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface FileUploadProps {
    projectId: string;
    onUploadComplete?: () => void;
}

interface UploadingFile {
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

const ACCEPTED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileUpload({ projectId, onUploadComplete }: FileUploadProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            // Simulate progress (in real app, use XMLHttpRequest for progress tracking)
            setUploadingFiles((prev) =>
                prev.map((f) => (f.file === file ? { ...f, progress: 50 } : f))
            );

            const result = await api.uploadDocument(projectId, file);

            setUploadingFiles((prev) =>
                prev.map((f) => (f.file === file ? { ...f, progress: 100, status: 'success' } : f))
            );

            return result;
        },
        onError: (error: Error, file: File) => {
            setUploadingFiles((prev) =>
                prev.map((f) =>
                    f.file === file ? { ...f, status: 'error', error: error.message } : f
                )
            );
        },
        onSuccess: () => {
            onUploadComplete?.();
            // Remove successful uploads after 2 seconds
            setTimeout(() => {
                setUploadingFiles((prev) => prev.filter((f) => f.status !== 'success'));
            }, 2000);
        },
    });

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            // Add files to uploading list
            const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
                file,
                progress: 0,
                status: 'uploading' as const,
            }));
            setUploadingFiles((prev) => [...prev, ...newFiles]);

            // Upload each file
            acceptedFiles.forEach((file) => {
                uploadMutation.mutate(file);
            });
        },
        [uploadMutation]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: ACCEPTED_FILE_TYPES,
        maxSize: MAX_FILE_SIZE,
        multiple: true,
    });

    const removeFile = (file: File) => {
        setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <Card>
                <CardContent className="pt-6">
                    <div
                        {...getRootProps()}
                        className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-primary/50'
                            }
            `}
                    >
                        <input {...getInputProps()} />
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        {isDragActive ? (
                            <p className="text-lg font-medium">Drop files here...</p>
                        ) : (
                            <>
                                <p className="text-lg font-medium mb-2">
                                    Drag & drop files here, or click to select
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Supports PDF, DOCX, TXT, CSV, XLSX (max 50MB per file)
                                </p>
                                <Button type="button" variant="outline">
                                    Browse Files
                                </Button>
                            </>
                        )}
                    </div>

                    {/* File rejections */}
                    {fileRejections.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {fileRejections.map(({ file, errors }) => (
                                <div
                                    key={file.name}
                                    className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                                >
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium">{file.name}</div>
                                        <div className="text-xs">{errors.map((e) => e.message).join(', ')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Uploading files */}
            {uploadingFiles.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {uploadingFiles.map(({ file, progress, status, error }) => (
                                <div key={file.name} className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium truncate">{file.name}</span>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatFileSize(file.size)}
                                                </span>
                                            </div>
                                            {status === 'uploading' && (
                                                <Progress value={progress} className="h-1 mt-1" />
                                            )}
                                            {status === 'error' && (
                                                <div className="text-xs text-destructive mt-1">{error}</div>
                                            )}
                                        </div>
                                        {status === 'success' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        )}
                                        {status === 'error' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 flex-shrink-0"
                                                onClick={() => removeFile(file)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
