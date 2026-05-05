<?php

namespace Database\Seeders;

use App\Models\Hospital;
use App\Models\User;
use App\Models\NurseProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class HospitalAndNurseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample hospitals
        $hospitals = Hospital::factory(5)->verified()->create();

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@healthcare.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '1234567890',
            ]
        );

        // Create sample nurses with default password
        foreach ($hospitals as $hospital) {
            for ($i = 1; $i <= 3; $i++) {
                $user = User::create([
                    'name' => "Nurse {$hospital->id}-{$i}",
                    'email' => "nurse{$hospital->id}{$i}@healthcare.com",
                    'password' => Hash::make('password123'),
                    'role' => 'nurse',
                    'phone' => fake()->phoneNumber(),
                    'contact' => fake()->phoneNumber(),
                    'hospital_id' => $hospital->id,
                ]);

                NurseProfile::create([
                    'user_id' => $user->id,
                    'hospital_id' => $hospital->id,
                    'license_number' => fake()->bothify('LIC-###-####'),
                    'is_verified' => false,
                    'account_status' => 'pending',
                    'experience_years' => fake()->numberBetween(1, 30),
                    'competence_areas' => ['nursing', 'patient_care'],
                ]);
            }
        }

        $this->command->info('Hospitals and nurses seeded successfully!');
        $this->command->info('Admin Email: admin@healthcare.com | Password: admin123');
        $this->command->info('Nurse Passwords: password123 (for all newly created nurses)');
    }
}
