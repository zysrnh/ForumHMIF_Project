<?php

namespace App\Http\Controllers;

use App\Models\KsmSurvey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class KsmSurveyController extends Controller
{
    /**
     * Tampilkan halaman kuesioner survei KSM untuk mahasiswa.
     */
    public function create(): InertiaResponse
    {
        return Inertia::render('Ksm/Survey', [
            'user' => Auth::user(),
        ]);
    }

    /**
     * Simpan respon survei KSM dari mahasiswa.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'respondent_name' => ['required', 'string', 'max:255'],
            'respondent_nim' => ['nullable', 'string', 'max:50'],
            'respondent_class' => ['nullable', 'string', 'max:50'],
            'semester_course' => ['required', 'string', 'max:255'],
            'interested_fields' => ['required', 'array', 'min:1', 'max:3'],
            'interested_fields.*' => ['string', 'max:255'],
            'activity_types' => ['required', 'array', 'min:1', 'max:2'],
            'activity_types.*' => ['string', 'max:255'],
            'learning_method' => ['required', 'string', 'max:255'],
            'interest_scale' => ['required', 'integer', 'between:1,4'],
            'preferred_days' => ['required', 'array', 'min:1', 'max:2'],
            'preferred_days.*' => ['string', 'max:50'],
            'preferred_time' => ['required', 'string', 'max:50'],
            'feedback' => ['nullable', 'string', 'max:2000'],
        ], [
            'interested_fields.max' => 'Pilih maksimal 3 bidang yang ingin kamu pelajari.',
            'activity_types.max' => 'Pilih maksimal 2 bentuk kegiatan yang ingin kamu ikuti.',
            'preferred_days.max' => 'Pilih maksimal 2 hari pelaksanaan.',
        ]);

        $validated['user_id'] = Auth::id();

        KsmSurvey::create($validated);

        return redirect()->route('ksm.survey.index')->with('success', 'Terima kasih! Respon survei KSM Anda berhasil disimpan.');
    }

    /**
     * Ambil data statistik dan survei KSM untuk dashboard pengurus/admin.
     *
     * @return array<string, mixed>
     */
    public static function getDashboardData(?string $search = null): array
    {
        $surveysQuery = KsmSurvey::latest();

        if ($search) {
            $surveysQuery->where(function ($q) use ($search) {
                $q->where('respondent_name', 'like', "%{$search}%")
                    ->orWhere('respondent_nim', 'like', "%{$search}%")
                    ->orWhere('respondent_class', 'like', "%{$search}%")
                    ->orWhere('semester_course', 'like', "%{$search}%");
            });
        }

        $allSurveys = KsmSurvey::all();
        $totalRespondents = $allSurveys->count();

        // Hitung rata-rata skala minat
        $avgInterest = $totalRespondents > 0
            ? round($allSurveys->avg('interest_scale'), 1)
            : 0;

        // Distribusi Matkul Semester 3
        $courseDistribution = $allSurveys->groupBy('semester_course')->map->count()->sortDesc();

        // Distribusi Bidang Minat
        $fieldDistribution = [];
        foreach ($allSurveys as $s) {
            if (is_array($s->interested_fields)) {
                foreach ($s->interested_fields as $f) {
                    $fieldDistribution[$f] = ($fieldDistribution[$f] ?? 0) + 1;
                }
            }
        }
        arsort($fieldDistribution);

        // Distribusi Bentuk Kegiatan
        $activityDistribution = [];
        foreach ($allSurveys as $s) {
            if (is_array($s->activity_types)) {
                foreach ($s->activity_types as $act) {
                    $activityDistribution[$act] = ($activityDistribution[$act] ?? 0) + 1;
                }
            }
        }
        arsort($activityDistribution);

        // Distribusi Hari
        $dayDistribution = [];
        foreach ($allSurveys as $s) {
            if (is_array($s->preferred_days)) {
                foreach ($s->preferred_days as $d) {
                    $dayDistribution[$d] = ($dayDistribution[$d] ?? 0) + 1;
                }
            }
        }
        arsort($dayDistribution);

        // Distribusi Waktu
        $timeDistribution = $allSurveys->groupBy('preferred_time')->map->count()->sortDesc();

        // Top Bidang
        $topField = ! empty($fieldDistribution) ? array_key_first($fieldDistribution) : '-';
        $topDay = ! empty($dayDistribution) ? array_key_first($dayDistribution) : '-';
        $topTime = $timeDistribution->isNotEmpty() ? $timeDistribution->keys()->first() : '-';

        return [
            'surveys' => $surveysQuery->paginate(15)->withQueryString(),
            'stats' => [
                'total' => $totalRespondents,
                'avgInterest' => $avgInterest,
                'topField' => $topField,
                'topDay' => $topDay,
                'topTime' => $topTime,
                'courseDistribution' => $courseDistribution,
                'fieldDistribution' => $fieldDistribution,
                'activityDistribution' => $activityDistribution,
                'dayDistribution' => $dayDistribution,
                'timeDistribution' => $timeDistribution,
            ],
            'filters' => [
                'search' => $search,
            ],
        ];
    }

    /**
     * Tampilkan Dashboard Admin untuk melihat rekapitulasi data survei KSM.
     */
    public function adminDashboard(Request $request): InertiaResponse
    {
        $data = self::getDashboardData($request->input('search'));

        return Inertia::render('Admin/KsmDashboard', $data);
    }

    /**
     * Export data respon survei ke CSV untuk admin pengurus.
     */
    public function exportCsv(): Response
    {
        $surveys = KsmSurvey::orderBy('id', 'desc')->get();

        $csvHeader = [
            'ID',
            'Nama Responden',
            'NIM',
            'Kelas',
            'Matkul Semester 3',
            'Bidang Minat',
            'Bentuk Kegiatan',
            'Metode Belajar',
            'Skala Minat (1-4)',
            'Hari Pilihan',
            'Waktu Pilihan',
            'Saran Ide',
            'Tanggal Isi',
        ];

        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, $csvHeader);

        foreach ($surveys as $item) {
            fputcsv($handle, [
                $item->id,
                $item->respondent_name,
                $item->respondent_nim ?? '-',
                $item->respondent_class ?? '-',
                $item->semester_course,
                is_array($item->interested_fields) ? implode(', ', $item->interested_fields) : '',
                is_array($item->activity_types) ? implode(', ', $item->activity_types) : '',
                $item->learning_method,
                $item->interest_scale,
                is_array($item->preferred_days) ? implode(', ', $item->preferred_days) : '',
                $item->preferred_time,
                $item->feedback ?? '',
                $item->created_at->format('d/m/Y H:i'),
            ]);
        }

        rewind($handle);
        $csvContent = stream_get_contents($handle);
        fclose($handle);

        $filename = 'rekap_survei_ksm_'.date('Ymd_His').'.csv';

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
