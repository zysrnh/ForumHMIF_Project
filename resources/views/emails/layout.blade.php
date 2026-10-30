<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Pemberitahuan HIMA IF' }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; padding: 24px 12px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border: 2px solid #1A467C; box-shadow: 4px 4px 0px 0px #1A467C;" cellspacing="0" cellpadding="0" border="0">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #1A467C; padding: 20px 24px; border-bottom: 2px solid #1A467C;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td width="48" style="vertical-align: middle;">
                                        @if(file_exists(public_path('logo/logo.png')))
                                            <img src="{{ $message->embed(public_path('logo/logo.png')) }}" alt="Logo HIMA IF" width="44" height="44" style="display: block; border: 2px solid #ffffff; background-color: #ffffff; padding: 2px;">
                                        @else
                                            <div style="width: 44px; height: 44px; background: #ffffff; color: #1A467C; font-weight: 900; text-align: center; line-height: 44px; font-size: 14px;">HMIF</div>
                                        @endif
                                    </td>
                                    <td style="vertical-align: middle; padding-left: 14px;">
                                        <div style="color: #ffffff; font-size: 16px; font-weight: 900; letter-spacing: -0.3px; text-transform: uppercase; line-height: 1.2;">
                                            FORUM MAHASISWA HMIF
                                        </div>
                                        <div style="color: #BAE6FD; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
                                            HIMA INFORMATIKA &bull; IDE LPKIA
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Subject / Badge Banner -->
                    @if(isset($badge))
                    <tr>
                        <td style="padding: 16px 24px 0 24px;">
                            <span style="display: inline-block; background-color: #C81E1E; color: #ffffff; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 10px; border: 1px solid #1A467C;">
                                {{ $badge }}
                            </span>
                        </td>
                    </tr>
                    @endif

                    <!-- Content Body -->
                    <tr>
                        <td style="padding: 20px 24px;">
                            @yield('content')
                        </td>
                    </tr>

                    <!-- Anti-Spam Notice Card -->
                    <tr>
                        <td style="padding: 0 24px 20px 24px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FEF3C7; border: 2px dashed #D97706; padding: 12px 14px;">
                                <tr>
                                    <td>
                                        <div style="font-size: 12px; font-weight: 800; color: #92400E; margin-bottom: 4px;">
                                            ⚠️ PENTING: AGAR TIDAK MASUK SPAM
                                        </div>
                                        <div style="font-size: 11px; color: #78350F; line-height: 1.5;">
                                            Jika email ini masuk ke folder <strong>Spam</strong> atau <strong>Junk</strong>, mohon klik tombol <strong>&quot;Bukan Spam&quot; (Report not spam / Trust sender)</strong> agar email konfirmasi dan pembaruan penting berikutnya langsung masuk ke Kotak Masuk (Inbox) kamu.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F1F5F9; border-top: 2px solid #1A467C; padding: 16px 24px; text-align: center;">
                            <div style="font-size: 11px; font-weight: 800; color: #1A467C; text-transform: uppercase; letter-spacing: 0.5px;">
                                &copy; 2026 HIMA INFORMATIKA &bull; IDE LPKIA
                            </div>
                            <div style="font-size: 10px; color: #64748B; margin-top: 4px;">
                                Sistem Informasi & Forum Aspirasi Mahasiswa Teknik Informatika
                            </div>
                            <div style="font-size: 10px; color: #94A3B8; margin-top: 2px;">
                                Email ini dikirim otomatis oleh sistem resmi <strong>info@hmif-lpkia.my.id</strong>
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
