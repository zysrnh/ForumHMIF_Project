import axios from 'axios';

export interface CommentItem {
    id: number;
    authorName: string;
    authorNim: string;
    authorRole?: string;
    isOfficial?: boolean;
    content: string;
    canDelete?: boolean;
    createdAt: string;
}

export interface AspirationItem {
    id: number;
    title: string;
    category: string;
    content: string;
    authorName: string;
    authorNim: string;
    authorClass?: string;
    isAnonymous: boolean;
    status: 'baru' | 'kurasi' | 'ksm' | 'tindak_lanjut';
    isKsmAgenda?: boolean;
    ksmDocketNumber?: string;
    ksmPlenoSchedule?: string;
    votes: number;
    hasVoted: boolean;
    isMine?: boolean;
    canDelete?: boolean;
    createdAt: string;
    comments: CommentItem[];
}

export const APP_CATEGORIES = [
    'Semua',
    'Akademik & Praktikum',
    'Fasilitas & Lab Komputer',
    'Proker & Event HIMA',
    'Advokasi & Kebijakan Kampus',
    'Karier & Magang',
    'Umum',
] as const;

export const DEFAULT_ASPIRATIONS: AspirationItem[] = [];

const EVENT_NAME = 'hmif-aspirations-synced';
let memoryAspirations: AspirationItem[] = [];

/**
 * Ambil daftar aspirasi langsung dari database server.
 */
export async function fetchAspirationsFromServer(): Promise<AspirationItem[]> {
    try {
        const response = await axios.get('/api/aspirations');
        if (response.data && Array.isArray(response.data.data)) {
            memoryAspirations = response.data.data;
            broadcastAspirations(memoryAspirations);
            return memoryAspirations;
        }
    } catch (err) {
        console.error('Gagal memuat aspirasi dari server:', err);
    }
    return memoryAspirations;
}

export function getSharedAspirations(): AspirationItem[] {
    return memoryAspirations;
}

function broadcastAspirations(items: AspirationItem[]): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
}

/**
 * Kirim aspirasi baru ke database server.
 */
export async function addSharedAspiration(
    data: Omit<AspirationItem, 'id' | 'votes' | 'hasVoted' | 'createdAt' | 'comments'>,
): Promise<AspirationItem | null> {
    try {
        const response = await axios.post('/api/aspirations', data);
        if (response.data && response.data.data) {
            const newItem: AspirationItem = response.data.data;
            memoryAspirations = [newItem, ...memoryAspirations];
            broadcastAspirations(memoryAspirations);
            return newItem;
        }
    } catch (err) {
        console.error('Gagal mengirim aspirasi ke database:', err);
    }
    return null;
}

/**
 * Vote / Batal Vote aspirasi ke server.
 */
export async function toggleVoteSharedAspiration(id: number): Promise<AspirationItem[]> {
    try {
        const response = await axios.post(`/api/aspirations/${id}/vote`);
        if (response.data && response.data.data) {
            const updatedItem: AspirationItem = response.data.data;
            memoryAspirations = memoryAspirations.map((item) =>
                item.id === id ? updatedItem : item
            );
            broadcastAspirations(memoryAspirations);
            return memoryAspirations;
        }
    } catch (err) {
        console.error('Gagal mengubah vote di server:', err);
    }
    return memoryAspirations;
}

/**
 * Tambah komentar aspirasi ke server.
 */
export async function addCommentSharedAspiration(
    aspirationId: number,
    comment: { content: string },
): Promise<AspirationItem[]> {
    try {
        const response = await axios.post(`/api/aspirations/${aspirationId}/comments`, {
            content: comment.content,
        });
        if (response.data && response.data.data) {
            const updatedItem: AspirationItem = response.data.data;
            memoryAspirations = memoryAspirations.map((item) =>
                item.id === aspirationId ? updatedItem : item
            );
            broadcastAspirations(memoryAspirations);
            return memoryAspirations;
        }
    } catch (err) {
        console.error('Gagal menambahkan komentar ke server:', err);
    }
    return memoryAspirations;
}

/**
 * Hapus aspirasi dari server (khusus admin / pembuat aspirasi).
 */
export async function deleteSharedAspiration(id: number): Promise<boolean> {
    try {
        await axios.delete(`/api/aspirations/${id}`);
        memoryAspirations = memoryAspirations.filter((item) => item.id !== id);
        broadcastAspirations(memoryAspirations);
        return true;
    } catch (err) {
        console.error('Gagal menghapus aspirasi dari server:', err);
        return false;
    }
}

/**
 * Hapus komentar dari server (khusus admin / pembuat komentar).
 */
export async function deleteSharedComment(commentId: number, aspirationId: number): Promise<boolean> {
    try {
        await axios.delete(`/api/aspirations/comments/${commentId}`);
        memoryAspirations = memoryAspirations.map((item) => {
            if (item.id === aspirationId) {
                return {
                    ...item,
                    comments: item.comments.filter((c) => c.id !== commentId),
                };
            }
            return item;
        });
        broadcastAspirations(memoryAspirations);
        return true;
    } catch (err) {
        console.error('Gagal menghapus komentar dari server:', err);
        return false;
    }
}

export function getAspirationStats(items?: AspirationItem[]) {
    const list = items || memoryAspirations;
    const total = list.length;
    const ksmCount = list.filter((item) => item.status === 'ksm' || item.isKsmAgenda).length;
    const actionCount = list.filter((item) => item.status === 'tindak_lanjut').length;

    return { total, ksmCount, actionCount };
}

export function subscribeAspirations(callback: (items: AspirationItem[]) => void) {
    if (typeof window === 'undefined') return () => {};

    const handler = (event: Event) => {
        const customEvent = event as CustomEvent<AspirationItem[]>;
        if (customEvent.detail) {
            callback(customEvent.detail);
        } else {
            callback(memoryAspirations);
        }
    };

    window.addEventListener(EVENT_NAME, handler);

    return () => {
        window.removeEventListener(EVENT_NAME, handler);
    };
}
