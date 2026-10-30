@extends('emails.layout', ['title' => 'Respon Survei KSM Baru - HIMA IF', 'badge' => 'Admin Notifikasi'])

@section('content')
<h2 style="color: #1A467C; font-size: 18px; font-weight: 900; margin-top: 0; margin-bottom: 12px; text-transform: uppercase;">
    Respon Baru Survei KSM
</h2>

<p style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
    Halo Pengurus KSM, ada respon survei minat dan kebutuhan baru yang masuk:
</p>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; border: 2px solid #1A467C; margin-bottom: 20px; padding: 14px 18px;">
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Nama Responden:</strong> {{ $survey->respondent_name }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>NIM / Kelas:</strong> {{ $survey->respondent_nim ?? '-' }} ({{ $survey->respondent_class ?? '-' }})</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Mata Kuliah:</strong> {{ $survey->semester_course }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Bidang Minat:</strong> {{ is_array($survey->interested_fields) ? implode(', ', $survey->interested_fields) : $survey->interested_fields }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Format Kegiatan:</strong> {{ is_array($survey->activity_types) ? implode(', ', $survey->activity_types) : $survey->activity_types }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Skala Minat:</strong> {{ $survey->interest_scale }} / 4</td>
    </tr>
    @if($survey->feedback)
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Saran / Masukan:</strong> <em>&ldquo;{{ $survey->feedback }}&rdquo;</em></td>
    </tr>
    @endif
</table>

<div style="text-align: center; margin: 20px 0;">
    <a href="{{ route('dashboard', ['tab' => 'ksm']) }}" style="display: inline-block; background-color: #1A467C; color: #ffffff; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; padding: 12px 24px; text-decoration: none; border: 2px solid #0f172a; box-shadow: 3px 3px 0px 0px #0f172a;">
        Lihat Rekap di Dashboard KSM &rarr;
    </a>
</div>
@endsection
