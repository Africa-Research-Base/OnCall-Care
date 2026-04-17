<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRequest extends Model
{
    protected $fillable = [
        'patient_id',
        'nurse_id',
        'status',
        'symptoms',
        'severity',
        'pickup_lat',
        'pickup_lng',
        'arrived_at',
        'completed_at',
        'reward_points_awarded',
        'triage_level',
        'age_group',
        'is_conscious',
        'history_notes',
        'cancelled_at',
        'cancellation_reason',
        'cancelled_by_role',
    ];

    protected $casts = [
        'arrived_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'reward_points_awarded' => 'integer',
        'symptoms' => 'array',
        'is_conscious' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function nurseProfile()
    {
        return $this->hasOneThrough(NurseProfile::class, User::class, 'id', 'user_id', 'nurse_id', 'id');
    }
}
