import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
    Project,
    CreateProjectInput,
    UpdateProjectInput,
    Source,
    ManualTextInput,
    BRD,
    ProjectStats,
    ApiResponse,
    EditRequest,
    EditResult,
    BRDVersion,
    ConflictCheckResponse,
    Conflict,
    RTMEntry,
    SentimentAnalysisResult
} from '@/types';

/**
 * API Client for BRD Generator Backend
 */
class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            // @ts-ignore
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            async (config) => {
                // Get Google token from global window object (set by AuthProvider)
                // @ts-ignore
                const getToken = window.__GET_TOKEN__;
                if (getToken) {
                    try {
                        const token = await getToken();
                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`;
                        }
                    } catch (error) {
                        console.error('Failed to get auth token:', error);
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError<ApiResponse<any>>) => {
                const message = error.response?.data?.error || error.message || 'An error occurred';
                return Promise.reject(new Error(message));
            }
        );
    }

    // ============================================
    // PROJECTS
    // ============================================

    async getProjects(): Promise<Project[]> {
        const response = await this.client.get<ApiResponse<Project[]>>('/projects');
        return response.data.data || [];
    }

    async getProject(id: string): Promise<Project> {
        const response = await this.client.get<ApiResponse<Project>>(`/projects/${id}`);
        if (!response.data.data) throw new Error('Project not found');
        return response.data.data;
    }

    async createProject(input: CreateProjectInput): Promise<Project> {
        const response = await this.client.post<ApiResponse<Project>>('/projects', input);
        if (!response.data.data) throw new Error('Failed to create project');
        return response.data.data;
    }

    async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
        const response = await this.client.patch<ApiResponse<Project>>(`/projects/${id}`, input);
        if (!response.data.data) throw new Error('Failed to update project');
        return response.data.data;
    }

    async deleteProject(id: string): Promise<void> {
        await this.client.delete(`/projects/${id}`);
    }

    // ============================================
    // SOURCES
    // ============================================

    async getSources(projectId: string): Promise<Source[]> {
        const response = await this.client.get<ApiResponse<Source[]>>(`/ingestion/sources/${projectId}`);
        return response.data.data || [];
    }

    async uploadDocument(projectId: string, file: File, sourceLabel?: string): Promise<Source> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);
        if (sourceLabel) formData.append('sourceLabel', sourceLabel);

        const response = await this.client.post<ApiResponse<Source>>('/ingestion/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.data.data) throw new Error('Failed to upload document');
        return response.data.data;
    }

    async addManualText(input: ManualTextInput): Promise<Source> {
        const response = await this.client.post<ApiResponse<Source>>('/ingestion/text', input);
        if (!response.data.data) throw new Error('Failed to add text');
        return response.data.data;
    }

    async deleteSource(sourceId: string): Promise<void> {
        await this.client.delete(`/ingestion/sources/${sourceId}`);
    }

    // ============================================
    // BRD PROCESSING
    // ============================================

    async processProject(projectId: string): Promise<ProjectStats> {
        const response = await this.client.post<ApiResponse<{ stats: ProjectStats }>>(
            `/brd/process/${projectId}`
        );
        if (!response.data.data) throw new Error('Failed to process project');
        return response.data.data.stats;
    }

    async generateBRD(projectId: string, templateId: string = 'standard'): Promise<string> {
        const response = await this.client.post<ApiResponse<{ brdId: string }>>(
            `/brd/generate/${projectId}`,
            { templateId }
        );
        if (!response.data.data) throw new Error('Failed to generate BRD');
        return response.data.data.brdId;
    }

    async getBRD(projectId: string): Promise<BRD | null> {
        try {
            const response = await this.client.get<ApiResponse<BRD>>(`/brd/${projectId}`);
            return response.data.data || null;
        } catch (error: any) {
            // Return null for 404 errors instead of throwing
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async getProjectStats(projectId: string): Promise<ProjectStats> {
        const response = await this.client.get<ApiResponse<ProjectStats>>(`/brd/${projectId}/stats`);
        if (!response.data.data) throw new Error('Failed to get stats');
        return response.data.data;
    }

    async exportBRD(projectId: string, format: 'json' | 'md'): Promise<Blob> {
        const response = await this.client.get(`/brd/${projectId}/export/${format}`, {
            responseType: 'blob',
        });
        return response.data;
    }

    // ============================================
    // STREAMING BRD GENERATION
    // ============================================

    generateBRDStream(
        projectId: string,
        onProgress: (section: string, content: any) => void,
        onComplete: (brdId: string) => void,
        onError: (error: string) => void
    ): () => void {
        const eventSource = new EventSource(
            `${this.client.defaults.baseURL}/brd/generate/${projectId}?stream=true`
        );

        eventSource.addEventListener('progress', (event) => {
            const data = JSON.parse(event.data);
            onProgress(data.section, data.content);
        });

        eventSource.addEventListener('complete', (event) => {
            const data = JSON.parse(event.data);
            onComplete(data.brdId);
            eventSource.close();
        });

        eventSource.addEventListener('error', (event: any) => {
            const data = event.data ? JSON.parse(event.data) : { error: 'Stream error' };
            onError(data.error);
            eventSource.close();
        });

        // Return cleanup function
        return () => eventSource.close();
    }
    // ============================================
    // EDITING & VERSIONING
    // ============================================

    async applyEdit(request: EditRequest): Promise<EditResult> {
        const response = await this.client.post<ApiResponse<EditResult>>('/edit/apply', request);
        if (!response.data.data) throw new Error('Failed to apply edit');
        return response.data.data;
    }

    async getVersionHistory(brdId: string): Promise<BRDVersion[]> {
        const response = await this.client.get<ApiResponse<BRDVersion[]>>(`/edit/${brdId}/history`);
        return response.data.data || [];
    }

    async rollbackToVersion(brdId: string, versionId: string): Promise<void> {
        await this.client.post(`/edit/${brdId}/rollback/${versionId}`);
    }

    // ============================================
    // CONFLICTS
    // ============================================

    async detectConflicts(projectId: string): Promise<ConflictCheckResponse> {
        const response = await this.client.post<ConflictCheckResponse>(`/conflicts/detect/${projectId}`);
        return response.data;
    }

    async getConflicts(projectId: string): Promise<Conflict[]> {
        const response = await this.client.get<ApiResponse<Conflict[]>>(`/conflicts/${projectId}`);
        return response.data.data || [];
    }

    async resolveConflict(conflictId: string, resolution: string, status: 'resolved' | 'ignored'): Promise<Conflict> {
        const response = await this.client.patch<ApiResponse<Conflict>>(`/conflicts/${conflictId}/resolve`, {
            resolution,
            status
        });
        if (!response.data.data) throw new Error('Failed to resolve conflict');
        return response.data.data;
    }

    async getRTM(projectId: string): Promise<RTMEntry[]> {
        const response = await this.client.get<ApiResponse<RTMEntry[]>>(`/rtm/${projectId}`);
        return response.data.data || [];
    }

    async getAnalytics(projectId: string): Promise<SentimentAnalysisResult> {
        const response = await this.client.get<ApiResponse<SentimentAnalysisResult>>(`/analytics/${projectId}`);
        return response.data.data!;
    }

    // ============================================
    // DATASET IMPORT
    // ============================================

    async importDataset(
        projectId: string,
        datasetType: 'enron_email' | 'ami_transcript' | 'meeting_text' | 'sample_emails' | 'sample_transcripts',
        file?: File,
        maxItems?: number,
        sourceLabel?: string,
        localFilePath?: string,
    ): Promise<{ sourcesCreated: number; totalParsed: number; totalFiltered: number }> {
        const formData = new FormData();
        formData.append('projectId', projectId);
        formData.append('datasetType', datasetType);
        if (maxItems) formData.append('maxItems', String(maxItems));
        if (sourceLabel) formData.append('sourceLabel', sourceLabel);
        if (file) formData.append('file', file);
        if (localFilePath) formData.append('localFilePath', localFilePath);

        const response = await this.client.post<ApiResponse<{ sourcesCreated: number; totalParsed: number; totalFiltered: number }>>(
            '/ingestion/dataset',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (!response.data.data) throw new Error('Dataset import failed');
        return response.data.data;
    }
}

// Export singleton instance
export const api = new ApiClient();
