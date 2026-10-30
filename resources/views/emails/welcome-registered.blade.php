@extends('emails.layout', ['title' => 'Selamat Datang di Forum HMIF', 'badge' => 'Pendaftaran Berhasil'])

@section('content')
<h2 style="color: #1A467C; font-size: 18px; font-weight: 900; margin-top: 0; margin-bottom: 12px; text-transform: uppercase;">
    Selamat Datang di Forum HMIF!
</h2>

<p style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
    Halo <strong>{{ $user->name }}</strong>,
</p>

<p style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 20px;">
    Akun kamu di <strong>Forum Mahasiswa Teknik Informatika (HMIF)</strong> telah berhasil dibuat. Kamu sekarang dapat menyampaikan aspirasi, memberikan vote, dan berpartisipasi dalam program Kelompok Studi Mahasiswa (KSM).
</p>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; border: 2px solid #1A467C; margin-bottom: 24px; padding: 14px 18px;">
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Nama Lengkap:</strong> {{ $user->name }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Email Kampus:</strong> {{ $user->email }}</td>
    </tr>
    @if($user->nim)
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>NIM:</strong> {{ $user->nim }}</td>
    </tr>
    @endif
</table>

<div style="text-align: center; margin: 24px 0;">
    <a href="{{ url('/') }}" style="display: inline-block; background-color: #1A467C; color: #ffffff; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; padding: 12px 24px; text-decoration: none; border: 2px solid #0f172a; box-shadow: 3px 3px 0px 0px #0f172a;">
        Kunjungi Forum HMIF &rarr;
    </a>
</div>
@endsection
