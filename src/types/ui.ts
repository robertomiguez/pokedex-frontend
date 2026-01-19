export type ViewMode = 'grid' | 'list' | 'table';

export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
}
