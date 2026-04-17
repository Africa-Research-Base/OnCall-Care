<?php

return [
    // Set to true when SPL token withdrawal goes live.
    'token_launched' => env('REWARDS_TOKEN_LAUNCHED', false),
    'network' => env('REWARDS_NETWORK', 'solana'),

    // Default points awarded per completed job by severity band.
    'points_by_severity' => [
        'red' => 1200,
        'amber' => 800,
        'green' => 500,
    ],

    // Default conversion rate used for withdrawal estimate.
    'points_per_token' => 100,
    'token_symbol' => env('REWARDS_TOKEN_SYMBOL', 'ONC'),
];
