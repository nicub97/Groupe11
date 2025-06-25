<?php

namespace App\Mail;

use App\Models\CodeBox;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CodeRetraitMail extends Mailable
{
    use Queueable, SerializesModels;

    public CodeBox $codeBox;

    public function __construct(CodeBox $codeBox)
    {
        $this->codeBox = $codeBox;
    }

    public function build()
    {
        $annonce = $this->codeBox->etapeLivraison->annonce;

        return $this->subject('Code de retrait')
            ->view('emails.code_retrait')
            ->with([
                'code' => $this->codeBox->code_temporaire,
                'annonce' => $annonce,
            ]);
    }
}
