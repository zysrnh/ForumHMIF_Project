<?php

namespace App\Http\Controllers;

use App\Mail\AdminAspirationNotificationMail;
use App\Mail\AspirationConfirmationMail;
use App\Models\Aspiration;
use App\Models\AspirationComment;
use App\Models\AspirationVote;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class AspirationController extends Controller
{
    /**
     * Daftar kategori aspirasi yang valid (selaras dengan APP_CATEGORIES di frontend).
     */
    private const CATEGORIES = [
        'Akademik & Praktikum',
        'Fasilitas & Lab Komputer',
        'Proker & Event HIMA',
        'Advokasi & Kebijakan Kampus',
        'Karier & Magang',
        'Umum',
    ];

    /**
     * Ambil seluruh aspirasi beserta komentar dan status vote pengunjung saat ini.
     */
    public function index(Request $request): JsonResponse
    {
        $voterKey = $this->voterKey($request);

        $aspirations = Aspiration::with('comments')
            ->latest('id')
            ->limit(300)
            ->get();

        $votedIds = AspirationVote::where('voter_key', $voterKey)
            ->whereIn('aspiration_id', $aspirations->pluck('id'))
            ->pluck('aspiration_id')
            ->all();

        return response()->json([
            'data' => $aspirations
                ->map(fn (Aspiration $item) => $this->serialize($item, in_array($item->id, $votedIds, true)))
                ->values(),
        ]);
    }

    /**
     * Simpan aspirasi baru (bisa dari tamu maupun mahasiswa yang login).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', Rule::in(self::CATEGORIES)],
            'content' => ['required', 'string', 'max:5000'],
            'authorName' => ['nullable', 'string', 'max:100'],
            'authorNim' => ['nullable', 'string', 'regex:/^[0-9]{9}$/'],
            'authorClass' => ['nullable', 'string', 'max:5'],
            'isAnonymous' => ['nullable', 'boolean'],
        ]);

        /** @var User|null $user */
        $user = Auth::user();
        $isAnonymous = (bool) ($validated['isAnonymous'] ?? false);

        if ($user) {
            $nim = $user->nim ?: (str_contains($user->email, '@') ? explode('@', $user->email)[0] : null);
            $authorName = $isAnonymous ? 'Mahasiswa IF' : $user->name;
            $authorNim = $isAnonymous ? ($nim ? substr($nim, 0, 5) . '***' : null) : $nim;
        } else {
            $guestName = trim((string) ($validated['authorName'] ?? ''));
            $isAnonymous = $isAnonymous || $guestName === '';
            $authorName = $isAnonymous ? 'Mahasiswa IF' : $guestName;
            $authorNim = $isAnonymous ? null : ($validated['authorNim'] ?? null);
        }

        $aspiration = DB::transaction(function () use ($validated, $user, $isAnonymous, $authorName, $authorNim) {
            $aspiration = Aspiration::create([
                'user_id' => $user?->id,
                'title' => trim($validated['title']),
                'category' => $validated['category'],
                'content' => trim($validated['content']),
                'author_name' => $authorName,
                'author_nim' => $authorNim,
                'author_class' => !empty($validated['authorClass']) ? strtoupper(trim($validated['authorClass'])) : null,
                'is_anonymous' => $isAnonymous,
                'status' => 'baru',
                'votes_count' => 0,
            ]);

            return $aspiration;
        });

        $aspiration->load('comments');

        // Kirim notifikasi email langsung ke info@hmif-lpkia.my.id dan mahasiswa
        try {
            $mailPayload = [
                'title' => $aspiration->title,
                'category' => $aspiration->category,
                'content' => $aspiration->content,
                'authorName' => $aspiration->author_name,
                'authorNim' => $aspiration->author_nim,
                'authorClass' => $aspiration->author_class,
                'authorEmail' => $user?->email,
            ];

            // 1. Notifikasi ke email resmi pengurus HMIF
            Mail::to('info@hmif-lpkia.my.id')->send(new AdminAspirationNotificationMail($mailPayload));

            // 2. Email konfirmasi/bukti tanda terima ke mahasiswa yang login
            if (!empty($user?->email)) {
                Mail::to($user->email)->send(new AspirationConfirmationMail($mailPayload));
            }
        } catch (\Throwable $e) {
            Log::warning('Gagal mengirim email aspirasi otomatis: ' . $e->getMessage());
        }

        return response()->json(['data' => $this->serialize($aspiration, false)], 201);
    }

    /**
     * Toggle dukungan (vote) untuk sebuah aspirasi.
     */
    public function vote(Request $request, Aspiration $aspiration): JsonResponse
    {
        $voterKey = $this->voterKey($request);

        $hasVoted = DB::transaction(function () use ($aspiration, $voterKey) {
            $existing = AspirationVote::where('aspiration_id', $aspiration->id)
                ->where('voter_key', $voterKey)
                ->first();

            if ($existing) {
                $existing->delete();
                $voted = false;
            } else {
                AspirationVote::create([
                    'aspiration_id' => $aspiration->id,
                    'user_id' => Auth::id(),
                    'voter_key' => $voterKey,
                ]);
                $voted = true;
            }

            $aspiration->update([
                'votes_count' => AspirationVote::where('aspiration_id', $aspiration->id)->count(),
            ]);

            return $voted;
        });

        $aspiration->load('comments');

        return response()->json(['data' => $this->serialize($aspiration, $hasVoted)]);
    }

    /**
     * Tambah komentar / tanggapan pada aspirasi.
     */
    public function comment(Request $request, Aspiration $aspiration): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:1000'],
        ]);

        /** @var User|null $user */
        $user = Auth::user();
        $isOfficial = $user?->isAdmin() ?? false;

        AspirationComment::create([
            'aspiration_id' => $aspiration->id,
            'user_id' => $user?->id,
            'author_name' => $user ? $user->name : 'Mahasiswa IF',
            'author_nim' => $user?->nim,
            'author_role' => $isOfficial ? 'Pengurus HIMA IF' : null,
            'is_official' => $isOfficial,
            'content' => trim($validated['content']),
        ]);

        $aspiration->load('comments');
        $hasVoted = AspirationVote::where('aspiration_id', $aspiration->id)
            ->where('voter_key', $this->voterKey($request))
            ->exists();

        return response()->json(['data' => $this->serialize($aspiration, $hasVoted)], 201);
    }

    /**
     * Hapus aspirasi (admin bisa hapus semua, mahasiswa hanya miliknya sendiri).
     */
    public function destroy(Aspiration $aspiration): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if (! $user->isAdmin() && $aspiration->user_id !== $user->id) {
            return response()->json(['message' => 'Kamu tidak punya akses untuk menghapus aspirasi ini.'], 403);
        }

        $aspiration->delete();

        return response()->json(['message' => 'Aspirasi berhasil dihapus.']);
    }

    /**
     * Hapus komentar (admin bisa hapus semua, mahasiswa hanya miliknya sendiri).
     */
    public function destroyComment(AspirationComment $comment): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if (! $user->isAdmin() && $comment->user_id !== $user->id) {
            return response()->json(['message' => 'Kamu tidak punya akses untuk menghapus komentar ini.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Komentar berhasil dihapus.']);
    }

    /**
     * Identitas unik pemberi vote: akun untuk user login, sesi untuk tamu.
     */
    private function voterKey(Request $request): string
    {
        if (Auth::check()) {
            return 'u:' . Auth::id();
        }

        return 's:' . $request->session()->getId();
    }

    /**
     * Bentuk data aspirasi sesuai interface AspirationItem di frontend.
     *
     * @return array<string, mixed>
     */
    private function serialize(Aspiration $item, bool $hasVoted): array
    {
        /** @var User|null $user */
        $user = Auth::user();
        $isAdmin = $user?->isAdmin() ?? false;
        $isMine = $user !== null && $item->user_id === $user->id;

        return [
            'id' => $item->id,
            'title' => $item->title,
            'category' => $item->category,
            'content' => $item->content,
            'authorName' => $item->author_name,
            'authorNim' => $item->author_nim ?? '',
            'authorClass' => $item->author_class,
            'isAnonymous' => $item->is_anonymous,
            'status' => $item->status,
            'isKsmAgenda' => $item->is_ksm_agenda,
            'ksmDocketNumber' => $item->ksm_docket_number,
            'ksmPlenoSchedule' => $item->ksm_pleno_schedule,
            'votes' => $item->votes_count,
            'hasVoted' => $hasVoted,
            'isMine' => $isMine,
            'canDelete' => $isAdmin || $isMine,
            'createdAt' => $item->created_at?->locale('id')->diffForHumans() ?? 'Baru saja',
            'comments' => $item->comments->map(function (AspirationComment $comment) use ($user, $isAdmin) {
                $isMyComment = $user !== null && $comment->user_id === $user->id;

                return [
                    'id' => $comment->id,
                    'authorName' => $comment->author_name,
                    'authorNim' => $comment->author_nim ?? '',
                    'authorRole' => $comment->author_role,
                    'isOfficial' => $comment->is_official,
                    'content' => $comment->content,
                    'canDelete' => $isAdmin || $isMyComment,
                    'createdAt' => $comment->created_at?->locale('id')->diffForHumans() ?? 'Baru saja',
                ];
            })->values()->all(),
        ];
    }
}
