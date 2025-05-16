<?php

namespace App\Mail;

use App\Models\TblSolicitud;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class NotificacionSolicitud extends Mailable
{
    use Queueable, SerializesModels;

    public $solicitud;
    public $empleados;
    public $tipoEnvio;

    public function __construct(TblSolicitud $solicitud, $empleados, $tipoEnvio = 'usuario')
    {
        $this->solicitud = $solicitud->load(['empresa', 'sede']);
        $this->empleados = $empleados;
        $this->tipoEnvio = $tipoEnvio;
    }


    public function build()
    {
        $pdf = Pdf::loadView('pdf.resumen_solicitud', [
            'solicitud' => $this->solicitud,
            'empleados' => $this->empleados,
            'tipoEnvio' => $this->tipoEnvio,
        ]);

        return $this
            ->subject('📦 Nueva Solicitud de Dotación - ' . $this->solicitud->codigoSolicitud)
            ->view('emails.plantilla_simple') // puede ser una vista simple con solo un mensaje
            ->attachData($pdf->output(), 'resumen_solicitud.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}
