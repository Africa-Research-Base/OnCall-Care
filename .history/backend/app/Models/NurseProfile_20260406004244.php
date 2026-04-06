<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NurseProfile extends Model
{
    protected $fillable = [
        'user_id',
        'license_number',
        'license_photo_url',
        'is_verified',
        'is_online',
        'earnings',
        'verification_level',
        'transport_mode',
        'competence_areas',
        'experience_years',
        'account_status',
        'suspended_until',
        'status_reason',
        'status_changed_at',
    ];

    protected $casts = [
        'competence_areas' => 'array',
        'is_verified' => 'boolean',
        'is_online' => 'boolean',
        'suspended_until' => 'datetime',
        'status_changed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
