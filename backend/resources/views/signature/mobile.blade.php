<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Firma Electrónica - {{ config('app.name') }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/signature_pad@5.0.7/dist/signature_pad.min.js"></script>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-md">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="text-center">
                <h1 class="text-2xl font-bold text-gray-800 mb-2">Firma Electrónica</h1>
                <p class="text-gray-600">Firme el documento usando su dedo o stylus</p>
            </div>
        </div>

        <!-- Información del documento -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Información del Documento</h2>
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600">Tipo:</span>
                    <span class="font-medium">{{ $document_data['document_type'] ?? 'Entrega' }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">ID:</span>
                    <span class="font-medium">{{ $document_data['document_id'] ?? 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Expira:</span>
                    <span class="font-medium text-red-600" id="expires-at">{{ $expires_at->format('H:i:s') }}</span>
                </div>
            </div>
        </div>

        <!-- Canvas de firma -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Firma</h2>
            <div class="border-2 border-dashed border-gray-300 rounded-lg">
                <canvas id="signature-pad" class="w-full h-64"></canvas>
            </div>
            <div class="mt-4 flex gap-2">
                <button id="clear-btn" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Limpiar
                </button>
                <button id="sign-btn" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Firmar
                </button>
            </div>
        </div>

        <!-- Estado -->
        <div id="status-message" class="hidden bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
            <p id="status-text"></p>
        </div>

        <!-- Loading -->
        <div id="loading" class="hidden bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded mb-6 text-center">
            <p>Procesando firma...</p>
        </div>
    </div>

    <script>
        // Configuración
        const token = '{{ $token }}';
        const expiresAt = new Date('{{ $expires_at->toISOString() }}');
        
        // Elementos del DOM
        const canvas = document.getElementById('signature-pad');
        const clearBtn = document.getElementById('clear-btn');
        const signBtn = document.getElementById('sign-btn');
        const statusMessage = document.getElementById('status-message');
        const statusText = document.getElementById('status-text');
        const loading = document.getElementById('loading');
        const expiresAtElement = document.getElementById('expires-at');

        // Inicializar SignaturePad
        const signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'rgb(0, 0, 0)',
            minWidth: 1,
            maxWidth: 3,
        });

        // Ajustar tamaño del canvas
        function resizeCanvas() {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext('2d').scale(ratio, ratio);
            signaturePad.clear();
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Eventos
        clearBtn.addEventListener('click', () => {
            signaturePad.clear();
        });

        signBtn.addEventListener('click', async () => {
            if (signaturePad.isEmpty()) {
                showStatus('Por favor, firme el documento antes de continuar.', 'error');
                return;
            }

            if (isExpired()) {
                showStatus('El token ha expirado. Recargue la página.', 'error');
                return;
            }

            try {
                showLoading(true);
                hideStatus();

                const signatureData = signaturePad.toDataURL('image/png');
                
                const response = await fetch(`/firma/${token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        signature: signatureData
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showStatus('¡Firma enviada correctamente!', 'success');
                    signBtn.disabled = true;
                    clearBtn.disabled = true;
                    signaturePad.off();
                } else {
                    showStatus(result.error || 'Error al enviar la firma', 'error');
                }

            } catch (error) {
                console.error('Error:', error);
                showStatus('Error de conexión. Intente nuevamente.', 'error');
            } finally {
                showLoading(false);
            }
        });

        // Funciones auxiliares
        function showStatus(message, type) {
            statusText.textContent = message;
            statusMessage.className = `px-4 py-3 rounded mb-6 ${
                type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
                type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
                'bg-blue-100 border border-blue-400 text-blue-700'
            }`;
            statusMessage.classList.remove('hidden');
        }

        function hideStatus() {
            statusMessage.classList.add('hidden');
        }

        function showLoading(show) {
            if (show) {
                loading.classList.remove('hidden');
                signBtn.disabled = true;
                clearBtn.disabled = true;
            } else {
                loading.classList.add('hidden');
                signBtn.disabled = false;
                clearBtn.disabled = false;
            }
        }

        function isExpired() {
            return new Date() > expiresAt;
        }

        // Actualizar contador de expiración
        function updateExpiration() {
            const now = new Date();
            const diff = expiresAt - now;
            
            if (diff <= 0) {
                expiresAtElement.textContent = 'Expirado';
                expiresAtElement.className = 'font-medium text-red-600';
                return;
            }
            
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            expiresAtElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (minutes < 1) {
                expiresAtElement.className = 'font-medium text-red-600';
            } else if (minutes < 2) {
                expiresAtElement.className = 'font-medium text-yellow-600';
            } else {
                expiresAtElement.className = 'font-medium text-gray-600';
            }
        }

        // Actualizar cada segundo
        setInterval(updateExpiration, 1000);
        updateExpiration();

        // Verificar si ya está expirado al cargar
        if (isExpired()) {
            showStatus('Este token ha expirado. Contacte al administrador.', 'error');
            signBtn.disabled = true;
            clearBtn.disabled = true;
            signaturePad.off();
        }
    </script>
</body>
</html>


