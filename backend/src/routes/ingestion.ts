import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { z } from 'zod';
import { parsePDF, getPDFMetadata } from '../parsers/pdfParser';
import { parseDOCX } from '../parsers/docxParser';
import { parseTextFile, parseCSV, parseExcel, structuredDataToText } from '../parsers/textParser';
import { parseEnronCSV, emailToIngestionText } from '../parsers/emailParser';
import { parseGenericTranscript, transcriptToIngestionText } from '../parsers/transcriptParser';
import { getSampleEmailsText, getSampleTranscriptsText } from '../utils/sampleDatasets';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================

const storage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: (parseInt(process.env.MAX_FILE_SIZE || '2048') * 1024 * 1024), // Default 2GB for dataset uploads
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'message/rfc822',       // .eml files
            'application/mbox',    // .mbox files
        ];
        // Also allow by extension for dataset files
        const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.csv', '.xlsx', '.xls', '.eml', '.mbox', '.json'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, DOCX, TXT, CSV, XLSX, EML, MBOX, JSON'));
        }
    },
});

// ============================================
// VALIDATION SCHEMAS
// ============================================

const manualTextSchema = z.object({
    projectId: z.string(),
    content: z.string().min(1),
    sourceLabel: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse uploaded file based on its type
 */
async function parseUploadedFile(filePath: string, mimeType: string): Promise<{
    content: string;
    metadata: Record<string, any>;
}> {
    let content = '';
    let metadata: Record<string, any> = {};

    try {
        if (mimeType === 'application/pdf') {
            content = await parsePDF(filePath);
            metadata = await getPDFMetadata(filePath);
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword'
        ) {
            content = await parseDOCX(filePath);
        } else if (mimeType === 'text/plain') {
            content = await parseTextFile(filePath);
        } else if (mimeType === 'text/csv') {
            const data = await parseCSV(filePath);
            content = structuredDataToText(data);
            metadata.rowCount = data.length;
        } else if (
            mimeType === 'application/vnd.ms-excel' ||
            mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
            const data = await parseExcel(filePath);
            const sheets = Object.keys(data);
            content = sheets.map(sheet => {
                return `Sheet: ${sheet}\n${structuredDataToText(data[sheet])}`;
            }).join('\n\n');
            metadata.sheets = sheets;
            metadata.totalRows = Object.values(data).reduce((sum, sheet) => sum + sheet.length, 0);
        }

        return { content, metadata };
    } catch (error) {
        throw new Error(`File parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/ingestion/upload
 * Upload and parse a document file
 */
router.post(
    '/upload',
    requireAuth,
    upload.single('file'),
    asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new ApiError(400, 'No file uploaded');
        }

        const { projectId, sourceLabel } = req.body;

        if (!projectId) {
            // Clean up uploaded file
            await fs.unlink(req.file.path);
            throw new ApiError(400, 'projectId is required');
        }

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.userId,
            },
        });

        if (!project) {
            await fs.unlink(req.file.path);
            throw new ApiError(404, 'Project not found');
        }

        // Parse the file
        const { content, metadata } = await parseUploadedFile(req.file.path, req.file.mimetype);

        // Store in database
        const source = await prisma.source.create({
            data: {
                projectId,
                sourceType: 'document',
                rawContent: content,
                metadata: JSON.stringify({
                    fileName: req.file.originalname,
                    fileSize: req.file.size,
                    mimeType: req.file.mimetype,
                    sourceLabel: sourceLabel || 'Uploaded Document',
                    ...metadata,
                }),
            },
        });

        // Clean up uploaded file
        await fs.unlink(req.file.path);

        // Update project status
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'ingesting' },
        });

        res.status(201).json({
            success: true,
            data: source,
        });
    })
);

/**
 * POST /api/ingestion/text
 * Ingest manual text input
 */
router.post(
    '/text',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const validatedData = manualTextSchema.parse(req.body);

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: {
                id: validatedData.projectId,
                userId: req.userId,
            },
        });

        if (!project) {
            throw new ApiError(404, 'Project not found');
        }

        // Store in database
        const source = await prisma.source.create({
            data: {
                projectId: validatedData.projectId,
                sourceType: 'manual',
                rawContent: validatedData.content,
                metadata: JSON.stringify({
                    sourceLabel: validatedData.sourceLabel || 'Manual Input',
                    ...validatedData.metadata,
                }),
            },
        });

        // Update project status
        await prisma.project.update({
            where: { id: validatedData.projectId },
            data: { status: 'ingesting' },
        });

        res.status(201).json({
            success: true,
            data: source,
        });
    })
);

/**
 * GET /api/ingestion/sources/:projectId
 * Get all sources for a project
 */
router.get(
    '/sources/:projectId',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.projectId as string,
                userId: req.userId,
            },
        });

        if (!project) {
            throw new ApiError(404, 'Project not found');
        }

        const sources = await prisma.source.findMany({
            where: { projectId: req.params.projectId as string },
            orderBy: { ingestedAt: 'desc' },
        });

        res.json({
            success: true,
            data: sources,
        });
    })
);

/**
 * DELETE /api/ingestion/sources/:sourceId
 * Delete a source
 */
router.delete(
    '/sources/:sourceId',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const sourceId = req.params.sourceId as string;
        // Get source and verify ownership through project
        const source = await prisma.source.findUnique({
            where: { id: sourceId },
            include: { project: true },
        });

        if (!source || source.project.userId !== req.userId) {
            throw new ApiError(404, 'Source not found');
        }

        await prisma.source.delete({
            where: { id: sourceId },
        });

        res.json({
            success: true,
            data: { message: 'Source deleted successfully' },
        });
    })
);

// ============================================
// DATASET IMPORT ROUTES
// ============================================

const datasetImportSchema = z.object({
    projectId: z.string(),
    datasetType: z.enum(['enron_email', 'ami_transcript', 'meeting_text', 'sample_emails', 'sample_transcripts']),
    maxItems: z.coerce.number().min(1).max(500).optional().default(50),
    sourceLabel: z.string().optional(),
    localFilePath: z.string().optional(), // Server-side file path (for large files like Enron CSV)
});

/**
 * POST /api/ingestion/dataset
 * Import from Enron email CSV, AMI transcripts, or built-in samples
 */
router.post(
    '/dataset',
    requireAuth,
    upload.single('file'),
    asyncHandler(async (req: Request, res: Response) => {
        const { projectId, datasetType, maxItems, sourceLabel, localFilePath } = datasetImportSchema.parse(req.body);

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: req.userId },
        });
        if (!project) {
            if (req.file) await fs.unlink(req.file.path);
            throw new ApiError(404, 'Project not found');
        }

        console.log(`[dataset] Import request: type=${datasetType}, maxItems=${maxItems}, hasFile=${!!req.file}, localPath=${localFilePath || 'none'}`);

        const sourcesCreated: any[] = [];
        let totalParsed = 0;
        let totalFiltered = 0;

        // ---- BUILT-IN SAMPLE DATA (no file needed) ----
        if (datasetType === 'sample_emails') {
            const emails = getSampleEmailsText();
            for (const emailText of emails.slice(0, maxItems)) {
                const source = await prisma.source.create({
                    data: {
                        projectId,
                        sourceType: 'email',
                        rawContent: emailText,
                        metadata: JSON.stringify({
                            sourceLabel: sourceLabel || 'Sample Enron Email',
                            datasetType: 'enron_email',
                            isSample: true,
                        }),
                    },
                });
                sourcesCreated.push(source);
            }
            totalParsed = emails.length;
        }

        else if (datasetType === 'sample_transcripts') {
            const transcripts = getSampleTranscriptsText();
            for (const transcriptText of transcripts.slice(0, maxItems)) {
                const source = await prisma.source.create({
                    data: {
                        projectId,
                        sourceType: 'meeting',
                        rawContent: transcriptText,
                        metadata: JSON.stringify({
                            sourceLabel: sourceLabel || 'Sample AMI Transcript',
                            datasetType: 'ami_transcript',
                            isSample: true,
                        }),
                    },
                });
                sourcesCreated.push(source);
            }
            totalParsed = transcripts.length;
        }

        // ---- FILE-BASED IMPORT ----
        else {
            if (!req.file) {
                throw new ApiError(400, 'File is required for this dataset type');
            }

            try {
                if (datasetType === 'enron_email') {
                    // Determine file path: uploaded file OR local server path
                    const csvPath = req.file?.path || localFilePath;
                    if (!csvPath) {
                        throw new ApiError(400, 'Please upload a CSV file or provide a local file path');
                    }

                    // Verify local path exists if provided
                    if (localFilePath && !req.file) {
                        try {
                            await fs.access(localFilePath);
                        } catch {
                            throw new ApiError(400, `Local file not found: ${localFilePath}`);
                        }
                    }

                    // Parse Enron CSV format using streaming
                    console.log(`[dataset] Starting Enron CSV parse: ${csvPath}, maxItems=${maxItems}`);
                    const { emails, total, filtered } = await parseEnronCSV(csvPath, maxItems);
                    console.log(`[dataset] Parsed ${total} emails, ${emails.length} kept, ${filtered} filtered`);
                    totalParsed = total;
                    totalFiltered = filtered;

                    for (const email of emails) {
                        const content = emailToIngestionText(email);
                        const source = await prisma.source.create({
                            data: {
                                projectId,
                                sourceType: 'email',
                                rawContent: content,
                                metadata: JSON.stringify({
                                    sourceLabel: sourceLabel || `Email: ${email.subject}`,
                                    datasetType: 'enron_email',
                                    from: email.from,
                                    to: email.to,
                                    subject: email.subject,
                                    date: email.date,
                                    folder: email.folder,
                                }),
                            },
                        });
                        sourcesCreated.push(source);
                    }
                    console.log(`[dataset] Created ${sourcesCreated.length} sources in DB`);

                    // Clean up uploaded temp file (not local path)
                    if (req.file) await fs.unlink(req.file.path).catch(() => { });
                }

                else if (datasetType === 'ami_transcript' || datasetType === 'meeting_text') {
                    // Parse meeting transcript (text or JSON)
                    const fileContent = await fs.readFile(req.file.path, 'utf-8');
                    const filename = path.basename(req.file.originalname, path.extname(req.file.originalname));

                    // Check if it's a JSON array of multiple transcripts
                    let transcriptTexts: string[] = [];
                    try {
                        const parsed = JSON.parse(fileContent);
                        if (Array.isArray(parsed)) {
                            transcriptTexts = parsed.map((item: any) =>
                                item.transcript || item.text || item.content || JSON.stringify(item)
                            );
                        } else {
                            transcriptTexts = [fileContent];
                        }
                    } catch {
                        // Not JSON, treat as single transcript
                        transcriptTexts = [fileContent];
                    }

                    totalParsed = transcriptTexts.length;
                    for (const text of transcriptTexts.slice(0, maxItems)) {
                        const transcript = parseGenericTranscript(text, filename);
                        const content = transcriptToIngestionText(transcript);
                        const source = await prisma.source.create({
                            data: {
                                projectId,
                                sourceType: 'meeting',
                                rawContent: content,
                                metadata: JSON.stringify({
                                    sourceLabel: sourceLabel || `Meeting: ${transcript.title}`,
                                    datasetType: 'ami_transcript',
                                    meetingId: transcript.meetingId,
                                    participants: transcript.participants,
                                    decisionsCount: transcript.decisions.length,
                                    requirementsCount: transcript.requirements.length,
                                    actionItemsCount: transcript.actionItems.length,
                                }),
                            },
                        });
                        sourcesCreated.push(source);
                    }
                }
            } finally {
                // Silently ignore if file was already cleaned up
                if (req.file) await fs.unlink(req.file.path).catch(() => { });
            }
        }

        // Update project status
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'ingesting' },
        });

        res.status(201).json({
            success: true,
            data: {
                sourcesCreated: sourcesCreated.length,
                totalParsed,
                totalFiltered,
                sources: sourcesCreated,
            },
        });
    })
);

export default router;
