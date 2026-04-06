<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OnCall Care Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-64 bg-slate-800 text-white flex flex-col">
            <div class="p-6 border-b border-slate-700">
                <h1 class="text-2xl font-bold text-red-500">OnCall Care</h1>
                <p class="text-xs text-gray-400">Admin Portal</p>
            </div>
            <nav class="flex-1 p-4 space-y-2">
                <a href="{{ route('admin.dashboard') }}" class="block p-3 rounded hover:bg-slate-700 {{ request()->routeIs('admin.dashboard') ? 'bg-slate-700 text-red-400' : '' }}">
                    <i class="fas fa-chart-line w-6 text-center"></i> Dashboard
                </a>
                <a href="{{ route('admin.activities') }}" class="block p-3 rounded hover:bg-slate-700 {{ request()->routeIs('admin.activities') ? 'bg-slate-700 text-red-400' : '' }}">
                    <i class="fas fa-list-alt w-6 text-center"></i> Activities
                </a>
                <a href="{{ route('admin.nurses') }}" class="block p-3 rounded hover:bg-slate-700 {{ request()->routeIs('admin.nurses') ? 'bg-slate-700 text-red-400' : '' }}">
                    <i class="fas fa-user-nurse w-6 text-center"></i> Nurses
                </a>
            </nav>
            <div class="p-4 border-t border-slate-700">
                <div class="flex items-center">
                    <img src="https://ui-avatars.com/api/?name=Admin+User&background=random" class="w-10 h-10 rounded-full mr-3">
                    <div>
                        <p class="font-bold">Super Admin</p>
                        <p class="text-xs text-green-400">Online</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-y-auto">
            <header class="bg-white shadow p-4 flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-800">@yield('title')</h2>
                <button class="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </header>
            <main class="p-8">
                @yield('content')
            </main>
        </div>
    </div>
</body>
</html>
