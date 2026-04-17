<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardSetting extends Model
{
    protected $fillable = [
        'red_points',
        'amber_points',
        'green_points',
        'points_per_token',
        'token_symbol',
    ];
}
