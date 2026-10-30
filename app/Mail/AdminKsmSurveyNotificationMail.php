<?php

namespace App\Mail;

use App\Models\KsmSurvey;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminKsmSurveyNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public KsmSurvey $survey;

    public function __construct(KsmSurvey $survey)
    {
        $this->survey = $survey;
    }

    public function build(): self
    {
        return $this->subject('Respon Survei KSM Baru dari ' . $this->survey->respondent_name)
            ->view('emails.admin-ksm-notification', [
                'survey' => $this->survey,
            ]);
    }
}
