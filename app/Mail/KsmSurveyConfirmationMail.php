<?php

namespace App\Mail;

use App\Models\KsmSurvey;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class KsmSurveyConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public KsmSurvey $survey;

    public function __construct(KsmSurvey $survey)
    {
        $this->survey = $survey;
    }

    public function build(): self
    {
        return $this->subject('Tanda Terima Survei KSM - HIMA IF')
            ->view('emails.ksm-confirmation', [
                'survey' => $this->survey,
            ]);
    }
}
