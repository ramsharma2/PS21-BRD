import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatDate(date);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Get status color for project status
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        ingesting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status] || colors.draft;
}

/**
 * Get priority color for requirements
 */
export function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
        must_have: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        should_have: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        could_have: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        wont_have: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[priority] || colors.could_have;
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
