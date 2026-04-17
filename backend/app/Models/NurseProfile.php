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
        'reward_points_balance',
        'reward_points_lifetime',
        'reward_points_withdrawn',
        'spl_wallet_address',
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
        'reward_points_balance' => 'integer',
        'reward_points_lifetime' => 'integer',
        'reward_points_withdrawn' => 'integer',
        'suspended_until' => 'datetime',
        'status_changed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
