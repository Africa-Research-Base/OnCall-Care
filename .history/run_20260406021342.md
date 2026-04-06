php artisan serve --host=0.0.0.0 --port=8000



php artisan tinker --execute="App\Models\User::updateOrCreate(['email' => 'admin@oncallcare.com'], ['name' => 'Super Admin', 'password' => 'Admin@12345', 'role' => 'admin']);"