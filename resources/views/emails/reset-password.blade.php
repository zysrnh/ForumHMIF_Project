@extends('emails.layout', ['title' => 'Atur Ulang Kata Sandi - Forum HMIF', 'badge' => 'Pemulihan Akun'])

@section('content')
<h2 style="color: #1A467C; font-size: 18px; font-weight: 900; margin-top: 0; margin-bottom: 12px; text-transform: uppercase;">
    Atur Ulang Kata Sandi Akun
</h2>

<p style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
    Halo <strong>{{ $user->name ?? 'Rekan Mahasiswa' }}</strong>,
</p>

<p style="font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 20px;">
    Kami menerima permintaan untuk mengatur ulang kata sandi akun Forum HMIF kamu. Klik tombol di bawah ini untuk membuat kata sandi baru:
</p>

<div style="text-align: center; margin: 28px 0;">
    <a href="{{ $resetUrl }}" style="display: inline-block; background-color: #1A467C; color: #ffffff; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; padding: 14px 28px; text-decoration: none; border: 2px solid #0f172a; box-shadow: 3px 3px 0px 0px #0f172a;">
        Atur Ulang Kata Sandi &rarr;
    </a>
</div>

<p style="font-size: 12px; color: #64748B; line-height: 1.5; margin-bottom: 12px;">
    Tautan pemulihan ini hanya berlaku selama <strong>60 menit</strong>. Jika kamu tidak pernah meminta pengaturan ulang kata sandi, abaikan email ini dan akunmu tetap aman.
</p>

<div style="border-top: 1px solid #E2E8F0; padding-top: 14px; margin-top: 20px;">
    <p style="font-size: 11px; color: #94A3B8; word-break: break-all; margin: 0;">
        Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut ke browsermu:<br>
        <a href="{{ $resetUrl }}" style="color: #1A467C; text-decoration: underline;">{{ $resetUrl }}</a>
    </p>
</div>
@endsection
