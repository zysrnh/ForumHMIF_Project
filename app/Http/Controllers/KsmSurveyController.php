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
        $user = Auth::user();
        $existingSurvey = null;

        if ($user) {
            $existingSurvey = KsmSurvey::where('user_id', $user->id)
                ->when($user->nim, function ($query, $nim) {
                    $query->orWhere('respondent_nim', $nim);
                })
                ->latest()
                ->first();
        }

        return Inertia::render('Ksm/Survey', [
            'user' => $user,
            'hasFilled' => $existingSurvey !== null,
            'existingSurvey' => $existingSurvey,
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

        $survey = KsmSurvey::create($validated);

        // Kirim email notifikasi ke admin dan tanda terima ke responden
        try {
            \Illuminate\Support\Facades\Mail::to('info@hmif-lpkia.my.id')->send(new \App\Mail\AdminKsmSurveyNotificationMail($survey));

            $recipientEmail = Auth::user()?->email;
            if ($recipientEmail) {
                \Illuminate\Support\Facades\Mail::to($recipientEmail)->send(new \App\Mail\KsmSurveyConfirmationMail($survey));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Gagal mengirim email survei KSM: ' . $e->getMessage());
        }

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
     * Export data respon survei ke format Excel (.xls) dengan styling bersih & rapi.
     */
    public function exportExcel(): Response
    {
        $surveys = KsmSurvey::orderBy('id', 'desc')->get();
        $generatedAt = now()->format('d/m/Y H:i').' WIB';

        ob_start();
        ?>
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Rekap Responden KSM</x:Name>
                            <x:WorksheetOptions>
                                <x:DisplayGridlines/>
                            </x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                body {
                    font-family: Calibri, 'Segoe UI', Arial, sans-serif;
                    font-size: 11pt;
                    color: #1e293b;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                .title-header {
                    font-size: 14pt;
                    font-weight: bold;
                    color: #1A467C;
                    text-align: left;
                }
                .subtitle-header {
                    font-size: 10pt;
                    color: #64748b;
                    text-align: left;
                }
                th {
                    background-color: #1A467C;
                    color: #ffffff;
                    font-weight: bold;
                    font-size: 10.5pt;
                    text-align: left;
                    padding: 10px 12px;
                    border: 1px solid #0f2e54;
                    vertical-align: middle;
                }
                td {
                    padding: 8px 12px;
                    border: 1px solid #cbd5e1;
                    font-size: 10pt;
                    vertical-align: top;
                }
                .zebra {
                    background-color: #f8fafc;
                }
                .text-center {
                    text-align: center;
                }
                .text-right {
                    text-align: right;
                }
                .text-string {
                    mso-number-format: "\@";
                }
                .font-bold {
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <table>
                <tr>
                    <td colspan="13" class="title-header" style="border: none; padding-bottom: 2px;">
                        REKAPITULASI SURVEI PEMINATAN KSM - HIMA INFORMATIKA
                    </td>
                </tr>
                <tr>
                    <td colspan="13" class="subtitle-header" style="border: none; padding-bottom: 15px;">
                        Institut LPKIA Bandung &bull; Waktu Unduh: <?= htmlspecialchars($generatedAt, ENT_QUOTES, 'UTF-8') ?> &bull; Total Responden: <?= count($surveys) ?> Mahasiswa
                    </td>
                </tr>
                <thead>
                    <tr>
                        <th style="width: 50px;" class="text-center">No</th>
                        <th style="width: 200px;">Nama Responden</th>
                        <th style="width: 130px;" class="text-center">NIM</th>
                        <th style="width: 100px;" class="text-center">Kelas</th>
                        <th style="width: 180px;">Matkul Semester 3</th>
                        <th style="width: 250px;">Bidang Minat</th>
                        <th style="width: 220px;">Bentuk Kegiatan</th>
                        <th style="width: 180px;">Metode Belajar</th>
                        <th style="width: 110px;" class="text-center">Skala Minat</th>
                        <th style="width: 150px;">Hari Pilihan</th>
                        <th style="width: 120px;">Waktu Pilihan</th>
                        <th style="width: 280px;">Saran / Ide</th>
                        <th style="width: 140px;" class="text-center">Tanggal Isi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ($surveys->isEmpty()) { ?>
                        <tr>
                            <td colspan="13" class="text-center" style="padding: 20px; color: #94a3b8; font-style: italic;">
                                Belum ada data respon survei yang masuk.
                            </td>
                        </tr>
                    <?php } else { ?>
                        <?php foreach ($surveys as $idx => $item) { ?>
                            <?php $isZebra = ($idx % 2 === 1) ? ' zebra' : ''; ?>
                            <tr class="<?= $isZebra ?>">
                                <td class="text-center"><?= $idx + 1 ?></td>
                                <td class="font-bold"><?= htmlspecialchars($item->respondent_name, ENT_QUOTES, 'UTF-8') ?></td>
                                <td class="text-center text-string"><?= htmlspecialchars($item->respondent_nim ?? '-', ENT_QUOTES, 'UTF-8') ?></td>
                                <td class="text-center"><?= htmlspecialchars($item->respondent_class ?? '-', ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars($item->semester_course, ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars(is_array($item->interested_fields) ? implode(', ', $item->interested_fields) : '', ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars(is_array($item->activity_types) ? implode(', ', $item->activity_types) : '', ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars($item->learning_method, ENT_QUOTES, 'UTF-8') ?></td>
                                <td class="text-center font-bold">Skala <?= (int) $item->interest_scale ?> / 4</td>
                                <td><?= htmlspecialchars(is_array($item->preferred_days) ? implode(', ', $item->preferred_days) : '', ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars($item->preferred_time, ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars($item->feedback ?? '-', ENT_QUOTES, 'UTF-8') ?></td>
                                <td class="text-center"><?= $item->created_at->format('d/m/Y H:i') ?></td>
                            </tr>
                        <?php } ?>
                    <?php } ?>
                </tbody>
            </table>
        </body>
        </html>
        <?php
        $content = ob_get_clean();
        $filename = 'rekap_survei_ksm_'.date('Ymd_His').'.xls';

        return response($content, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Alias untuk backward compatibility export CSV.
     */
    public function exportCsv(): Response
    {
        return $this->exportExcel();
    }

    /**
     * Hapus respon survei KSM (khusus admin).
     */
    public function destroy(KsmSurvey $survey): RedirectResponse
    {
        $respondent = $survey->respondent_name;
        $survey->delete();

        return redirect()->route('dashboard', ['tab' => 'ksm'])->with('success', "Data survei dari {$respondent} berhasil dihapus.");
    }
}
