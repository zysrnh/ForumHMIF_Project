<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminNewUserRegisteredMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function build(): self
    {
        return $this->subject('Pendaftaran Mahasiswa Baru: ' . $this->user->name)
            ->view('emails.admin-new-user', [
                'user' => $this->user,
            ]);
    }
}
