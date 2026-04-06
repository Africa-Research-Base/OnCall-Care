<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminActionLog extends Model
{
    protected $fillable = [
        'admin_id',
        'target_user_id',
        'action',
        'entity_type',
        'entity_id',
        'reason',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
