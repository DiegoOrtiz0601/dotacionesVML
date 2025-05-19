<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', 'Arial Rounded MT Bold', sans-serif;
      font-size: 14px;
      line-height: 1.7;
      margin: 30px;
    }

    .encabezado-tabla {
      width: 100%;
      margin-bottom: 20px;
      padding-bottom: 20px;
    }

    .encabezado-tabla td {
      vertical-align: middle;   
    }

    .titulo {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .logo {
      text-align: right;
    }

    .logo img {
      max-height: 50px;
      width: auto;
      object-fit: contain;
    }

    .mb-2 { margin-bottom: 10px; }
    .mb-4 { margin-bottom: 20px; }
    .text-sm { font-size: 14px; }

    table.data {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 30px;
    }

    table.data th, table.data td {
      border: 1px solid #444;
      padding: 5px;
      text-align: left;
    }

    table.data th {
      background-color: #f3f4f6;
      font-weight: bold;
    }

    ol {
      padding-left: 1.5rem;
    }

    .firma {
      text-align: center;
      margin-top: 50px;
    }

    .firma img {
      height: 80px;
      margin-bottom: 0;
    }

    .firma-linea {
      border-top: 1px solid #000;
      width: 60%;
      margin: 0 auto;
    }
  </style>
</head>
<body>

  <table class="encabezado-tabla">
    <tr>
      <td style="width: 30%;"></td>
      <td style="width: 40%;" class="titulo">Acta de Entrega de Dotación</td>
      <td style="width: 30%;" class="logo">
        @if($logo && str_starts_with($logo, 'data:image'))
  <img src="{{ $logo }}" alt="Logo empresa">
@endif
      </td>
    </tr>
  </table>

  <div class="mb-2"><strong>Señor(a):</strong> {{ $empleado['nombres'] }}</div>
  <div class="mb-2"><strong>Ref.:</strong> Acta de Entrega de Dotación</div>
  <div class="mb-2"><strong>Fecha de entrega:</strong> {{ $fecha }}</div>

  <br>

  <div class="mb-4">
    Por medio de la presente acta, el trabajador certifica que la empresa <strong>{{ $empresa }}</strong>,
    identificada con NIT <strong>{{ $nit }}</strong>, hace entrega de la dotación correspondiente.
  </div>

  <div class="mb-2"><strong>La cual consta de:</strong></div>
  <table class="data text-sm">
    <thead>
      <tr>
        <th>Nombre del Elemento</th>
        <th>Talla</th>
        <th>Cantidad Entregada</th>
      </tr>
    </thead>
    <tbody>
      @foreach ($empleado['elementos'] as $el)
        <tr>
          <td>{{ $el['nombre'] }}</td>
          <td>{{ $el['talla'] }}</td>
          <td>{{ $el['cantidad_aprobada'] }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>

  <div class="mb-2"><strong>El trabajador ACEPTA y manifiesta que:</strong></div>
  <ol>
    <li>La dotación que aquí se entrega es y será de la empresa en todo momento.</li>
    <li>En caso de terminación del contrato o nueva dotación, se compromete a devolverla si se lo solicitan.</li>
    <li>En caso de daño de la dotación o parte de ella, el trabajador debe devolverla a la empresa.</li>
    <li>Autoriza expresamente a la empresa a descontar de salarios y liquidación el valor de la dotación si no la devuelve.</li>
  </ol>

  <div class="firma">
    @if($firma)
      <img src="{{ $firma }}" alt="Firma del empleado">
    @endif
    <div class="firma-linea"></div>
    <p><strong>LA FIRMA DEL EMPLEADO</strong></p>
    <p>c.c. No. {{ $empleado['documento'] }}</p>
  </div>

</body>
</html>
