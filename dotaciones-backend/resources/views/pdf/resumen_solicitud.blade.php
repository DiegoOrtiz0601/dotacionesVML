<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: sans-serif;
      font-size: 13px;
      color: #333;
      margin: 30px;
    }

    h2 {
      color: #004085;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 20px;
    }

    th,
    td {
      border: 1px solid #ccc;
      padding: 8px;
    }

    th {
      background-color: #f0f0f0;
      text-align: left;
    }

    footer {
      font-size: 11px;
      margin-top: 30px;
      color: #555;
    }
  </style>
</head>

<body>
  @php
  $logo = public_path('images/logos/' . ($solicitud->empresa->ruta_logo ?? ''));
  @endphp

  @if(file_exists($logo))
  <div style="text-align: center;">
    <img src="{{ $logo }}" alt="Logo de la empresa" height="60">
  </div>
  @endif
  <p>Estimado equipo,</p>

  <p>Se ha aprobado una solicitud de dotación con el siguiente resumen. Adjuntamos los elementos aprobados para su conocimiento y trámite:</p>

  <h2>Resumen de Aprobación – {{ $solicitud->codigoSolicitud }}</h2>

  <p><strong>Empresa:</strong> {{ $solicitud->empresa->NombreEmpresa ?? 'No definido' }}</p>
  <p><strong>Sede:</strong> {{ $solicitud->sede->NombreSede ?? 'No definido' }}</p>
  <p><strong>Estado de la Solicitud:</strong> {{ $solicitud->estadoSolicitud }}</p>

  @foreach ($empleados as $emp)
  <h4>👤 Empleado: {{ $emp['nombreEmpleado'] }} ({{ $emp['documentoEmpleado'] }})</h4>
  <table>
    <thead>
      <tr>
        <th>Elemento</th>
        <th>Talla</th>
        <th style="text-align: center;">Cantidad Solicitada</th>
        <th style="text-align: center;">Cantidad Aprobada</th>
        <th>Observación</th>
      </tr>
    </thead>
    <tbody>
      @foreach ($emp['elementos'] as $el)
      <tr>
        <td>{{ $el['nombreElemento'] }}</td>
        <td>{{ $el['talla'] }}</td>
        <td style="text-align: center">{{ $el['cantidadSolicitada'] }}</td>
        <td style="text-align: center">{{ $el['cantidad'] }}</td>
        <td>{{ $el['observacion'] ?? '-' }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
  @endforeach

  <p>Para cualquier duda o comentario, puede comunicarse con el área de Talento Humano.</p>

  <footer>
    Este es un mensaje automático generado por el sistema de Dotaciones VML. No responda a este correo.
  </footer>
</body>

</html>