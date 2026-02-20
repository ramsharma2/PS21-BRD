import { create } from 'zustand';
import type { Project } from '@/types';

interface ProjectStore {
    // Current project
    currentProject: Project | null;
    setCurrentProject: (project: Project | null) => void;

    // Projects list
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    addProject: (project: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    removeProject: (id: string) => void;

    // UI state
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
    // Current project
    currentProject: null,
    setCurrentProject: (project) => set({ currentProject: project }),

    // Projects list
    projects: [],
    setProjects: (projects) => set({ projects }),
    addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
    updateProject: (id, updates) =>
        set((state) => ({
            projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
            currentProject:
                state.currentProject?.id === id
                    ? { ...state.currentProject, ...updates }
                    : state.currentProject,
        })),
    removeProject: (id) =>
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
        })),

    // UI state
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));
