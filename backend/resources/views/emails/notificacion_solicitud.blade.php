<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body>
  <p>Hola,</p>

  @if ($tipo === 'compras')
    <p>El área de Talento Humano ha aprobado una nueva solicitud de dotación con código <strong>{{ $solicitud->codigoSolicitud }}</strong>.</p>
    <p>Adjunto encontrarás el resumen de elementos aprobados para gestión de entrega.</p>
  @else
    <p>Estimado(a) {{ $solicitud->nombreSolicitante }},</p>
    <p>Tu solicitud de dotación con código <strong>{{ $solicitud->codigoSolicitud }}</strong> ha sido procesada por el área de Talento Humano.</p>
    <p>Adjunto encontrarás el resumen con los detalles de la aprobación, incluyendo justificación de posibles cambios.</p>
  @endif

  <p>Saludos cordiales,<br>Dotaciones VML</p>
</body>
</html>
