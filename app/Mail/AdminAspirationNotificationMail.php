<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminAspirationNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $aspiration;

    public function __construct(array $aspiration)
    {
        $this->aspiration = $aspiration;
    }

    public function build(): self
    {
        $author = $this->aspiration['authorName'] ?? 'Mahasiswa';
        return $this->subject('Aspirasi Baru Masuk di Forum HMIF (' . $author . ')')
            ->view('emails.admin-aspiration-notification', [
                'aspiration' => $this->aspiration,
            ]);
    }
}
