<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - OnCall Care</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-100 flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 class="text-2xl font-bold text-slate-800">Admin Login</h1>
        <p class="text-sm text-slate-500 mt-2 mb-6">Sign in to access the admin web panel.</p>

        @if($errors->any())
            <div class="mb-4 rounded-md bg-red-100 border border-red-200 text-red-800 px-4 py-3 text-sm">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('admin.login.submit') }}" class="space-y-4">
            @csrf
            <div>
                <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus class="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500" />
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input id="password" type="password" name="password" required class="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500" />
            </div>

            <label class="inline-flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="remember" value="1" class="rounded border-slate-300" />
                Remember me
            </label>

            <button type="submit" class="w-full bg-slate-800 text-white py-2 rounded-md font-semibold hover:bg-slate-700 transition">
                Sign In
            </button>
        </form>
    </div>
</body>
</html>
