@extends('emails.layout', ['title' => 'Tanda Terima Survei KSM - HIMA IF', 'badge' => 'Survei KSM Diterima'])

@section('content')
<h2 style="color: #1A467C; font-size: 18px; font-weight: 900; margin-top: 0; margin-bottom: 12px; text-transform: uppercase;">
    Terima Kasih Atas Partisipasimu!
</h2>

<p style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
    Halo <strong>{{ $survey->respondent_name }}</strong>,
</p>

<p style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 20px;">
    Jawaban survei kebutuhan dan minat <strong>Kelompok Studi Mahasiswa (KSM) HIMA IF</strong> kamu telah berhasil diterima oleh sistem. Masukan ini sangat berharga untuk menentukan silabus materi, jadwal kelas rutin, dan program mentoring mendatang.
</p>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; border: 2px solid #1A467C; margin-bottom: 20px; padding: 14px 18px;">
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Prioritas Matkul:</strong> {{ $survey->semester_course }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Bidang Teknologi:</strong> {{ is_array($survey->interested_fields) ? implode(', ', $survey->interested_fields) : $survey->interested_fields }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Bentuk Kegiatan:</strong> {{ is_array($survey->activity_types) ? implode(', ', $survey->activity_types) : $survey->activity_types }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Waktu Dipilih:</strong> {{ is_array($survey->preferred_days) ? implode(', ', $survey->preferred_days) : $survey->preferred_days }} ({{ $survey->preferred_time }})</td>
    </tr>
</table>

<p style="font-size: 12px; color: #64748B; line-height: 1.5; margin-bottom: 0;">
    Pengurus Divisi KSM HIMA IF akan segera merilis jadwal dan pengumuman kelompok belajar di kanal resmi himpunan.
</p>
@endsection
