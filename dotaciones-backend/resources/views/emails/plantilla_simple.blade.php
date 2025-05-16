<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; color: #333; margin: 20px; }
    .header-logo { margin-bottom: 20px; }
    .footer { margin-top: 40px; font-size: 12px; color: #555; border-top: 1px solid #ccc; padding-top: 10px; }
    .firma { margin-top: 30px; }
  </style>
</head>
<body>

@if($solicitud->empresa && $solicitud->empresa->ruta_logo)
  <div style="text-align: center; margin-bottom: 15px;">
    <img src="{{ public_path($solicitud->empresa->ruta_logo) }}" height="60" alt="Logo Empresa">
  </div>
@endif


  <p>Estimado(a),</p>

  <p>Le informamos que la <strong>solicitud de dotación</strong> con código <strong>{{ $solicitud->codigoSolicitud }}</strong> ha sido <strong>aprobada</strong> por el área de Talento Humano.</p>

  <p>Adjunto encontrará el documento en PDF con el detalle completo de los elementos autorizados por empleado.</p>

  <p>Por favor, revise el archivo y continúe con el trámite correspondiente.</p>

  <div class="firma">
    <p>Atentamente,</p>
    <p><strong>{{ auth()->user()->NombresUsuarioAutorizado ?? 'Sistema VML' }}</strong><br>
    Área de Talento Humano<br>
    VML Technologies</p>
  </div>

  <div class="footer">
    Este es un mensaje automático enviado por el sistema de gestión de dotaciones. No responda directamente a este correo.
  </div>

</body>
</html>
