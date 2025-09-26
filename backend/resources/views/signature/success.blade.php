<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Firma Completada - {{ config('app.name') }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-md">
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
            <div class="text-green-500 text-6xl mb-4">✅</div>
            <h1 class="text-2xl font-bold text-gray-800 mb-4">Firma Completada</h1>
            <p class="text-gray-600 mb-4">{{ $message }}</p>
            @if(isset($signed_at))
                <p class="text-sm text-gray-500 mb-6">
                    Firmado el: {{ $signed_at->format('d/m/Y H:i:s') }}
                </p>
            @endif
            <button onclick="window.close()" class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors">
                Cerrar
            </button>
        </div>
    </div>
</body>
</html>


