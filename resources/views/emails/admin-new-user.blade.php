@extends('emails.layout', ['title' => 'Mahasiswa Baru Mendaftar - Forum HMIF', 'badge' => 'Admin Notifikasi'])

@section('content')
<h2 style="color: #1A467C; font-size: 18px; font-weight: 900; margin-top: 0; margin-bottom: 12px; text-transform: uppercase;">
    Pendaftaran Pengguna Baru
</h2>

<p style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
    Halo Admin HIMA IF, ada mahasiswa baru yang baru saja mendaftarkan akun di sistem:
</p>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; border: 2px solid #1A467C; margin-bottom: 20px; padding: 14px 18px;">
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Nama:</strong> {{ $user->name }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Email:</strong> {{ $user->email }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>NIM:</strong> {{ $user->nim ?? '-' }}</td>
    </tr>
    <tr>
        <td style="font-size: 12px; color: #475569; padding: 4px 0;"><strong>Waktu Daftar:</strong> {{ now()->translatedFormat('d F Y, H:i') }} WIB</td>
    </tr>
</table>

<div style="text-align: center; margin: 20px 0;">
    <a href="{{ route('dashboard', ['tab' => 'users']) }}" style="display: inline-block; background-color: #1A467C; color: #ffffff; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; padding: 12px 24px; text-decoration: none; border: 2px solid #0f172a; box-shadow: 3px 3px 0px 0px #0f172a;">
        Kelola di Dashboard &rarr;
    </a>
</div>
@endsection
