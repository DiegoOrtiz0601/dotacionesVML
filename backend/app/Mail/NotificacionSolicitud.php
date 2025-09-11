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

    public $excelInfo;

    public function __construct(TblSolicitud $solicitud, $empleados, $tipoEnvio = 'usuario', $excelInfo = null)
    {
        $this->solicitud = $solicitud->load(['empresa', 'sede']);
        $this->empleados = $empleados;
        $this->tipoEnvio = $tipoEnvio;
        $this->excelInfo = $excelInfo;
    }


    public function build()
    {
        $pdf = Pdf::loadView('pdf.resumen_solicitud', [
            'solicitud' => $this->solicitud,
            'empleados' => $this->empleados,
            'tipoEnvio' => $this->tipoEnvio,
        ]);

        $mail = $this
            ->subject('📦 Nueva Solicitud de Dotación - ' . $this->solicitud->codigoSolicitud)
            ->view('emails.plantilla_simple')
            ->attachData($pdf->output(), 'resumen_solicitud.pdf', [
                'mime' => 'application/pdf',
            ]);

        // Adjuntar Excel si se generó
        if ($this->excelInfo && isset($this->excelInfo['file_path'])) {
            $mail->attach($this->excelInfo['file_path'], [
                'as' => $this->excelInfo['filename'],
                'mime' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ]);
        }

        return $mail;
    }
}
