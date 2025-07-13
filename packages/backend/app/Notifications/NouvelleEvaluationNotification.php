<?php

namespace App\Notifications;

use App\Models\Intervention;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NouvelleEvaluationNotification extends Notification
{
    use Queueable;

    public Intervention $intervention;

    public function __construct(Intervention $intervention)
    {
        $this->intervention = $intervention;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle évaluation reçue')
            ->line('Une nouvelle évaluation a été reçue sur une prestation terminée.')
            ->line('Type de prestation : ' . $this->intervention->prestation->type_prestation)
            ->line('Note : ' . $this->intervention->note . '/5')
            ->line('Commentaire : ' . ($this->intervention->commentaire_client ?? '')); 
    }

    public function toArray(object $notifiable): array
    {
        return [
            'intervention_id' => $this->intervention->id,
            'prestation_id' => $this->intervention->prestation_id,
            'note' => $this->intervention->note,
        ];
    }
}