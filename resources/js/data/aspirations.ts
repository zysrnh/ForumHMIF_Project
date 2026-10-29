export interface CommentItem {
    id: number;
    authorName: string;
    authorNim: string;
    authorRole?: string;
    isOfficial?: boolean;
    content: string;
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

export const DEFAULT_ASPIRATIONS: AspirationItem[] = [
    {
        id: 1,
        title: 'Penambahan Kapasitas RAM & Update Tool AI di Lab Komputer 3',
        category: 'Fasilitas & Lab Komputer',
        content: 'Saat praktikum Machine Learning & Mobile Programming, PC di Lab 3 sering mengalami lag dan freeze saat emulator Android Studio dijalankan bersamaan. Mohon diajukan penambahan RAM menjadi minimal 16GB dan update SSD.',
        authorName: 'Rian Pratama',
        authorNim: '230414012',
        isAnonymous: false,
        status: 'ksm',
        isKsmAgenda: true,
        ksmDocketNumber: '#KSM-2026-01',
        ksmPlenoSchedule: 'Sidang Pleno KSM Genap 2026 - Ristek & Sarpras',
        votes: 84,
        hasVoted: true,
        createdAt: '2 jam lalu',
        comments: [
            {
                id: 101,
                authorName: 'Divisi Advokasi & Ristek HMIF',
                authorNim: 'HMIF-OFFICIAL',
                authorRole: 'Pengurus HIMA IF',
                isOfficial: true,
                content: 'Aspirasi ini telah kami verifikasi dan masuk ke dalam agenda prioritas sidang KSM bersama Kepala Lab dan Prodi.',
                createdAt: '1 jam lalu',
            },
            {
                id: 102,
                authorName: 'Bagas Aditya',
                authorNim: '220414055',
                content: 'Setuju banget, kemarin pas responsi sempat crash dan project harus di-reopen dari backup.',
                createdAt: '45 menit lalu',
            },
        ],
    },
    {
        id: 2,
        title: 'Request Bimbingan & Mentoring Struktur Data dari Kakak Tingkat',
        category: 'Akademik & Praktikum',
        content: 'Banyak mahasiswa tingkat awal yang keteteran di materi Pointer, Graph, dan Dynamic Programming. Perlu ada sesi klinik koding mingguan yang dibimbing divisi ristek HIMA sebelum UTS.',
        authorName: 'Mahasiswa 2026',
        authorNim: '250414088',
        isAnonymous: false,
        status: 'ksm',
        isKsmAgenda: true,
        ksmDocketNumber: '#KSM-2026-02',
        ksmPlenoSchedule: 'Sidang Pleno KSM Genap 2026 - Diklat Akademik',
        votes: 67,
        hasVoted: false,
        createdAt: '5 jam lalu',
        comments: [
            {
                id: 201,
                authorName: 'Divisi Diklat HMIF',
                authorNim: 'HMIF-OFFICIAL',
                authorRole: 'Pengurus HIMA IF',
                isOfficial: true,
                content: 'Usulan program kerja mentoring peer-to-peer sudah masuk draft kurasi dan siap disahkan di KSM minggu depan.',
                createdAt: '3 jam lalu',
            },
        ],
    },
    {
        id: 3,
        title: 'Perbaikan Stabilitas Wi-Fi Gedung B Lantai 2 Khusus Jam Kuliah',
        category: 'Fasilitas & Lab Komputer',
        content: 'Koneksi Wi-Fi sering terputus mendadak terutama pada jam 10.00 - 14.00 WIB. Mengingat sebagian besar materi praktikum dan submit tugas menggunakan LMS cloud, hal ini sangat mengganggu aktivitas kuliah.',
        authorName: 'Siti Nurhaliza',
        authorNim: '220414005',
        isAnonymous: false,
        status: 'tindak_lanjut',
        isKsmAgenda: false,
        votes: 65,
        hasVoted: true,
        createdAt: '1 hari lalu',
        comments: [
            {
                id: 301,
                authorName: 'Dimas Prasetyo',
                authorNim: '210414019',
                content: 'Sangat terasa di ruang B203 sinyalnya sering drop ke 1 bar.',
                createdAt: '20 jam lalu',
            },
            {
                id: 302,
                authorName: 'Divisi Advokasi HMIF',
                authorNim: 'HMIF-OFFICIAL',
                authorRole: 'Pengurus HIMA IF',
                isOfficial: true,
                content: 'Surat rekomendasi perbaikan Access Point sudah diteruskan ke Biro Sarana & IT Kampus kemarin sore.',
                createdAt: '18 jam lalu',
            },
        ],
    },
    {
        id: 4,
        title: 'Adakan Hackathon Internal IF dengan Tema AI Agents & Web Modern',
        category: 'Proker & Event HIMA',
        content: 'Biar portofolio anak IF makin nendang buat magang industri, usul KSM adakan kompetisi hackathon 24 jam di kampus bareng mentor alumni dan praktisi startup.',
        authorName: 'Fullstack Enthusiast',
        authorNim: '230414067',
        isAnonymous: false,
        status: 'ksm',
        isKsmAgenda: true,
        ksmDocketNumber: '#KSM-2026-03',
        ksmPlenoSchedule: 'Sidang Pleno KSM Genap 2026 - Kemahasiswaan & Event',
        votes: 53,
        hasVoted: false,
        createdAt: '1 hari lalu',
        comments: [
            {
                id: 401,
                authorName: 'Rina Kusuma',
                authorNim: '230414015',
                content: 'Bagus banget usulannya, terutama bedah portofolio proyek kuliah biar layak dilirik industri.',
                createdAt: '1 hari lalu',
            },
        ],
    },
    {
        id: 5,
        title: 'Pengadaan Akun GitHub Enterprise & JetBrains Student Pack Kampus',
        category: 'Akademik & Praktikum',
        content: 'Banyak mahasiswa terkendala verifikasi email saat klaim JetBrains dan Copilot. Alangkah baiknya jika HIMA memfasilitasi kerja sama atau panduan kolektif lisensi software dev untuk seluruh angkatan.',
        authorName: 'Mahasiswa IF',
        authorNim: '240414***',
        isAnonymous: true,
        status: 'kurasi',
        isKsmAgenda: false,
        votes: 38,
        hasVoted: false,
        createdAt: '2 hari lalu',
        comments: [
            {
                id: 501,
                authorName: 'Divisi Diklat HMIF',
                authorNim: 'HMIF-OFFICIAL',
                authorRole: 'Pengurus HIMA IF',
                isOfficial: true,
                content: 'Sedang kami koordinasikan dengan pihak BAAK dan Pusat Komputer kampus terkait domain DNS fellow untuk whitelist GitHub Student Developer Pack.',
                createdAt: '1 hari lalu',
            },
        ],
    },
    {
        id: 6,
        title: 'Workshop Persiapan Magang Kampus Merdeka & Portofolio Tech',
        category: 'Karier & Magang',
        content: 'Perlu sharing session dari alumni yang lolos MSIB Bangkit dan tech companies ternama, agar mahasiswa semester 5-6 bisa mempersiapkan CV ATS dan tes koding.',
        authorName: 'Dian Permana',
        authorNim: '230414033',
        isAnonymous: false,
        status: 'kurasi',
        isKsmAgenda: false,
        votes: 42,
        hasVoted: false,
        createdAt: '3 hari lalu',
        comments: [],
    },
];

const STORAGE_KEY = 'hmif_shared_aspirations_v2';
const EVENT_NAME = 'hmif-aspirations-synced';

export function getSharedAspirations(): AspirationItem[] {
    if (typeof window === 'undefined') {
        return DEFAULT_ASPIRATIONS;
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {
        // Fallback jika json parse gagal
    }

    // Default initialization
    saveSharedAspirations(DEFAULT_ASPIRATIONS);
    return DEFAULT_ASPIRATIONS;
}

export function saveSharedAspirations(items: AspirationItem[]): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
    } catch {
        // Silently catch quota exceeded or storage disabled
    }
}

export function addSharedAspiration(
    data: Omit<AspirationItem, 'id' | 'votes' | 'hasVoted' | 'createdAt' | 'comments'>,
): AspirationItem {
    const all = getSharedAspirations();

    const isKsm = data.isKsmAgenda || data.status === 'ksm';
    const nextKsmIndex = all.filter((a) => a.isKsmAgenda || a.status === 'ksm').length + 1;

    const newItem: AspirationItem = {
        ...data,
        id: Date.now(),
        votes: 1,
        hasVoted: true,
        createdAt: 'Baru saja',
        status: isKsm ? 'ksm' : data.status,
        isKsmAgenda: isKsm,
        ksmDocketNumber: isKsm ? `#KSM-2026-0${nextKsmIndex}` : undefined,
        ksmPlenoSchedule: isKsm ? 'Sidang Pleno KSM Mendatang - Kurasi Terbuka' : undefined,
        comments: [],
    };

    const updated = [newItem, ...all];
    saveSharedAspirations(updated);
    return newItem;
}

export function toggleVoteSharedAspiration(id: number): AspirationItem[] {
    const all = getSharedAspirations();
    const updated = all.map((item) => {
        if (item.id === id) {
            const newHasVoted = !item.hasVoted;
            return {
                ...item,
                hasVoted: newHasVoted,
                votes: newHasVoted ? item.votes + 1 : Math.max(0, item.votes - 1),
            };
        }
        return item;
    });

    saveSharedAspirations(updated);
    return updated;
}

export function addCommentSharedAspiration(
    aspirationId: number,
    comment: Omit<CommentItem, 'id' | 'createdAt'>,
): AspirationItem[] {
    const all = getSharedAspirations();
    const newComment: CommentItem = {
        ...comment,
        id: Date.now(),
        createdAt: 'Baru saja',
    };

    const updated = all.map((item) => {
        if (item.id === aspirationId) {
            return {
                ...item,
                comments: [...item.comments, newComment],
            };
        }
        return item;
    });

    saveSharedAspirations(updated);
    return updated;
}

export function getAspirationStats(items?: AspirationItem[]) {
    const list = items || getSharedAspirations();
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
            callback(getSharedAspirations());
        }
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);

    return () => {
        window.removeEventListener(EVENT_NAME, handler);
        window.removeEventListener('storage', handler);
    };
}
