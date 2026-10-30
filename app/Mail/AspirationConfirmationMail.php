<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AspirationConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $aspiration;

    public function __construct(array $aspiration)
    {
        $this->aspiration = $aspiration;
    }

    public function build(): self
    {
        return $this->subject('Aspirasi Kamu Telah Terkirim ke Forum HMIF')
            ->view('emails.aspiration-confirmation', [
                'aspiration' => $this->aspiration,
            ]);
    }
}
