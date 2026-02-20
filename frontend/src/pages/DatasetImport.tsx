import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
    Mail, FileText, Upload, Zap, CheckCircle2,
    AlertCircle, ArrowRight, Database, Filter, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/services/api';

type DatasetType = 'enron_email' | 'ami_transcript' | 'meeting_text' | 'sample_emails' | 'sample_transcripts';

interface DatasetOption {
    id: DatasetType;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
    badgeColor: string;
    requiresFile: boolean;
    acceptedFormats: string;
    tips: string[];
    sourceUrl?: string;
}

const DATASET_OPTIONS: DatasetOption[] = [
    {
        id: 'sample_emails',
        label: 'Sample Enron Emails',
        description: 'Load 5 built-in realistic business emails with project requirements, decisions, and stakeholder feedback — no download needed.',
        icon: <Zap className="h-6 w-6 text-yellow-400" />,
        badge: 'Instant Demo',
        badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        requiresFile: false,
        acceptedFormats: '',
        tips: [
            'Includes noise emails (lunch plans, auto-replies) to demo filtering',
            'Contains real project requirements buried in conversations',
            'Perfect for live hackathon demos',
        ],
    },
    {
        id: 'sample_transcripts',
        label: 'Sample AMI Transcripts',
        description: 'Load 2 built-in meeting transcripts with stakeholder discussions, design decisions, and requirement debates — no download needed.',
        icon: <Zap className="h-6 w-6 text-yellow-400" />,
        badge: 'Instant Demo',
        badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        requiresFile: false,
        acceptedFormats: '',
        tips: [
            'Includes role-based speakers (PM, Designer, Marketing)',
            'Contains decisions, action items, and requirements',
            'Pre-labeled for easy AI extraction',
        ],
    },
    {
        id: 'enron_email',
        label: 'Enron Email Dataset',
        description: '~500K real business emails from Enron employees. Upload the CSV from Kaggle to test noise filtering at scale.',
        icon: <Mail className="h-6 w-6 text-blue-400" />,
        badge: 'Kaggle Dataset',
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        requiresFile: true,
        acceptedFormats: '.csv',
        tips: [
            'Download from kaggle.com/datasets/wcukierski/enron-email-dataset',
            'Upload the emails.csv file (or a subset)',
            'Noise emails are automatically filtered out',
            'Set max items to 50-100 for a quick demo',
        ],
        sourceUrl: 'https://www.kaggle.com/datasets/wcukierski/enron-email-dataset',
    },
    {
        id: 'ami_transcript',
        label: 'AMI Meeting Corpus',
        description: '279 meeting transcripts from scenario-based design projects. Upload .txt or .json files from HuggingFace.',
        icon: <FileText className="h-6 w-6 text-purple-400" />,
        badge: 'HuggingFace Dataset',
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        requiresFile: true,
        acceptedFormats: '.txt, .json',
        tips: [
            'Download from huggingface.co/datasets/knkarthick/AMI',
            'Upload individual .txt transcript files',
            'Or upload a JSON array of transcripts',
            'Speaker labels (PM, ME, ID, UI) are auto-detected',
        ],
        sourceUrl: 'https://huggingface.co/datasets/knkarthick/AMI',
    },
    {
        id: 'meeting_text',
        label: 'Custom Meeting Transcript',
        description: 'Upload your own meeting transcript in plain text or JSON format. Speaker labels like "PM:" are auto-detected.',
        icon: <Upload className="h-6 w-6 text-green-400" />,
        badge: 'Custom Upload',
        badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
        requiresFile: true,
        acceptedFormats: '.txt, .json',
        tips: [
            'Format: "SPEAKER: text" on each line',
            'Or upload a JSON array: [{speaker, text}, ...]',
            'Decisions, requirements, and action items are auto-detected',
        ],
    },
];

export default function DatasetImport() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [selectedDataset, setSelectedDataset] = useState<DatasetType | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [maxItems, setMaxItems] = useState(50);
    const [localFilePath, setLocalFilePath] = useState('');
    const [importResult, setImportResult] = useState<{ sourcesCreated: number; totalParsed: number; totalFiltered: number } | null>(null);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);

    const selectedOption = DATASET_OPTIONS.find(o => o.id === selectedDataset);

    const importMutation = useMutation({
        mutationFn: () => api.importDataset(
            projectId!,
            selectedDataset!,
            uploadedFile || undefined,
            maxItems,
            undefined,
            localFilePath || undefined,
        ),
        onSuccess: (data) => {
            setImportResult(data);
            setErrorDetail(null);
            toast({
                title: '✅ Dataset Imported!',
                description: `${data.sourcesCreated} sources added to your project.`,
            });
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.error || error?.message || 'Failed to import dataset. Please try again.';
            setErrorDetail(msg);
            toast({
                title: 'Import Failed',
                description: msg,
                variant: 'destructive',
            });
        },
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setUploadedFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: selectedOption?.acceptedFormats
            ? Object.fromEntries(
                selectedOption.acceptedFormats.split(', ').map(ext => {
                    const mimeMap: Record<string, string> = {
                        '.csv': 'text/csv',
                        '.txt': 'text/plain',
                        '.json': 'application/json',
                    };
                    return [mimeMap[ext] || 'application/octet-stream', [ext]];
                })
            )
            : undefined,
        maxFiles: 1,
        disabled: !selectedOption?.requiresFile,
    });

    const canImport = selectedDataset && (!selectedOption?.requiresFile || uploadedFile);

    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');

    const handleGenerateBRD = async () => {
        if (!projectId) return;
        setIsProcessing(true);
        try {
            setProcessingStep('Filtering noise and extracting requirements...');
            await api.processProject(projectId);
            setProcessingStep('Navigating to BRD editor...');
            navigate(`/projects/${projectId}/brd`);
        } catch (err: any) {
            setIsProcessing(false);
            setProcessingStep('');
            toast({
                title: 'Processing Failed',
                description: err?.message || 'Failed to process sources. Please try again.',
                variant: 'destructive',
            });
        }
    };

    if (importResult) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Card className="max-w-lg w-full border-green-500/30 bg-green-500/5">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-400" />
                        </div>
                        <CardTitle className="text-2xl text-green-400">Import Successful!</CardTitle>
                        <CardDescription>Your dataset has been ingested and is ready for BRD generation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="rounded-lg bg-muted p-3">
                                <p className="text-2xl font-bold text-foreground">{importResult.sourcesCreated}</p>
                                <p className="text-xs text-muted-foreground mt-1">Sources Added</p>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                                <p className="text-2xl font-bold text-foreground">{importResult.totalParsed}</p>
                                <p className="text-xs text-muted-foreground mt-1">Total Parsed</p>
                            </div>
                            <div className="rounded-lg bg-muted p-3">
                                <p className="text-2xl font-bold text-yellow-400">{importResult.totalFiltered}</p>
                                <p className="text-xs text-muted-foreground mt-1">Noise Filtered</p>
                            </div>
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-2">
                            <Filter className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">
                                <span className="text-yellow-400 font-medium">{importResult.totalFiltered} noise emails</span> were automatically filtered out (lunch plans, auto-replies, newsletters).
                            </p>
                        </div>

                        {/* Processing status */}
                        {isProcessing && (
                            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                                    <p className="text-sm font-medium text-primary">AI Processing...</p>
                                </div>
                                <p className="text-xs text-muted-foreground pl-6">{processingStep}</p>
                                <Progress value={undefined} className="animate-pulse h-1" />
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                disabled={isProcessing}
                                onClick={() => { setImportResult(null); setUploadedFile(null); setSelectedDataset(null); }}
                            >
                                Import More
                            </Button>
                            <Button
                                className="flex-1"
                                disabled={isProcessing}
                                onClick={handleGenerateBRD}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    <>Generate BRD <ArrowRight className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Database className="h-4 w-4" />
                        <span>Dataset Import</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-foreground">Select Source</span>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Import Dataset</h1>
                    <p className="text-muted-foreground mt-1">
                        Load real-world business communication data to generate your BRD. Start with built-in samples for an instant demo.
                    </p>
                </div>

                {/* Dataset Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DATASET_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => { setSelectedDataset(option.id); setUploadedFile(null); }}
                            className={`text-left rounded-xl border p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${selectedDataset === option.id
                                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                : 'border-border bg-card'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-muted">
                                    {option.icon}
                                </div>
                                <Badge className={`text-xs border ${option.badgeColor}`}>
                                    {option.badge}
                                </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">{option.label}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{option.description}</p>
                        </button>
                    ))}
                </div>

                {/* Configuration Panel */}
                {selectedOption && (
                    <Card className="border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {selectedOption.icon}
                                {selectedOption.label}
                            </CardTitle>
                            <CardDescription>Configure your import settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Tips */}
                            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-blue-400" />
                                    Tips
                                </p>
                                <ul className="space-y-1">
                                    {selectedOption.tips.map((tip, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                                {selectedOption.sourceUrl && (
                                    <a
                                        href={selectedOption.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                                    >
                                        Download Dataset <ArrowRight className="h-3 w-3" />
                                    </a>
                                )}
                            </div>

                            {/* File Upload */}
                            {selectedOption.requiresFile && (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Upload File <span className="text-muted-foreground">({selectedOption.acceptedFormats})</span>
                                    </label>
                                    <div
                                        {...getRootProps()}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                            ? 'border-primary bg-primary/10'
                                            : uploadedFile
                                                ? 'border-green-500 bg-green-500/10'
                                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                            }`}
                                    >
                                        <input {...getInputProps()} />
                                        {uploadedFile ? (
                                            <div className="space-y-2">
                                                <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto" />
                                                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB — Click to change
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                                                <p className="font-medium text-foreground">
                                                    {isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{selectedOption.acceptedFormats}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Local file path alternative for large files */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">or use local server path</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground mb-1 block">
                                            Server-side file path <span className="text-yellow-400">(for large files like the 1.7GB Enron CSV)</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. C:\Users\you\Downloads\emails.csv"
                                            value={localFilePath}
                                            onChange={e => setLocalFilePath(e.target.value)}
                                            className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            The backend reads this path directly — no upload needed. Leave empty to use the uploaded file above.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Max Items */}
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    Max items to import: <span className="text-primary font-bold">{maxItems}</span>
                                </label>
                                <input
                                    type="range"
                                    min={5}
                                    max={200}
                                    step={5}
                                    value={maxItems}
                                    onChange={e => setMaxItems(Number(e.target.value))}
                                    className="w-full accent-primary"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>5 (quick demo)</span>
                                    <span>200 (comprehensive)</span>
                                </div>
                            </div>

                            {/* Import Button */}
                            <Button
                                className="w-full"
                                size="lg"
                                disabled={!canImport || importMutation.isPending}
                                onClick={() => importMutation.mutate()}
                            >
                                {importMutation.isPending ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Importing & Filtering...
                                    </>
                                ) : (
                                    <>
                                        <Database className="mr-2 h-4 w-4" />
                                        {selectedOption.requiresFile ? 'Import Dataset' : 'Load Sample Data'}
                                    </>
                                )}
                            </Button>

                            {importMutation.isPending && (
                                <div className="space-y-2">
                                    <Progress value={undefined} className="animate-pulse" />
                                    <p className="text-xs text-center text-muted-foreground">
                                        Parsing emails, filtering noise, and storing sources...
                                    </p>
                                </div>
                            )}

                            {/* Error detail display */}
                            {errorDetail && !importMutation.isPending && (
                                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-red-400">Import Failed</p>
                                        <p className="text-xs text-muted-foreground mt-1 font-mono">{errorDetail}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
