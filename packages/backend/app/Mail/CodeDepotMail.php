<?php

namespace App\Mail;

use App\Models\CodeBox;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CodeDepotMail extends Mailable
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

        return $this->subject('Code de d\xC3\xA9p\xC3\xB4t')
            ->view('emails.code_depot')
            ->with([
                'code' => $this->codeBox->code_temporaire,
                'annonce' => $annonce,
            ]);
    }
}
