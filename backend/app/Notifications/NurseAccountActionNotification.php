<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NurseAccountActionNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $type,
        private readonly string $title,
        private readonly string $message,
        private readonly array $meta = []
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'meta' => $this->meta,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
