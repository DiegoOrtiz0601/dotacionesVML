<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TblSolicitud;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class PDFSolicitudController extends Controller
{
    public function descargarPDF($id)
    {
        try {
            Log::info('🔄 Iniciando descarga de PDF para solicitud ID: ' . $id);
            
            // Obtener datos de la solicitud con todas las relaciones necesarias
            $solicitud = TblSolicitud::with([
                'empleados.elementos.elemento',
                'empresa',
                'sede',
                'usuario'
            ])->find($id);
            
            if (!$solicitud) {
                Log::error('❌ Solicitud no encontrada con ID: ' . $id);
                return response()->json(['error' => 'Solicitud no encontrada'], 404);
            }
            
            Log::info('📋 Solicitud encontrada para PDF:', [
                'id' => $solicitud->id,
                'codigo' => $solicitud->codigoSolicitud,
                'empleados_count' => $solicitud->empleados ? count($solicitud->empleados) : 0
            ]);

            // Preparar datos para la vista del PDF
            $empleadosMail = [];
            if ($solicitud->empleados) {
                foreach ($solicitud->empleados as $empleado) {
                    $elementos = [];
                    if ($empleado->elementos) {
                        foreach ($empleado->elementos as $elemento) {
                            $elementos[] = [
                                'nombreElemento' => $elemento->elemento ? $elemento->elemento->nombreElemento : 'Elemento no encontrado',
                                'talla' => $elemento->TallaElemento,
                                'cantidadSolicitada' => $elemento->Cantidad, // ✅ Campo que espera la vista
                                'cantidad' => $elemento->Cantidad, // ✅ Campo que espera la vista
                                'observacion' => $empleado->observaciones ?? '' // ✅ Campo que espera la vista
                            ];
                        }
                    }
                    
                    $empleadosMail[] = [
                        'nombreEmpleado' => $empleado->nombreEmpleado,
                        'documentoEmpleado' => $empleado->documentoEmpleado,
                        'tipoSolicitud' => $empleado->tipoSolicitud,
                        'elementos' => $elementos,
                        'observaciones' => $empleado->observaciones ?? '',
                        'evidencias' => $empleado->evidencias ?? [],
                        'historial' => $empleado->historial ?? []
                    ];
                }
            }

            // Generar el PDF usando la vista existente
            $pdf = Pdf::loadView('pdf.resumen_solicitud', [
                'solicitud' => $solicitud->load(['empresa', 'sede']),
                'empleados' => $empleadosMail
            ]);

            // Configurar el PDF
            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial'
            ]);

            // Generar nombre del archivo
            $filename = 'resumen_solicitud_' . ($solicitud->codigoSolicitud ?? 'SIN_CODIGO') . '_' . date('Y-m-d_H-i-s') . '.pdf';
            
            Log::info('✅ PDF generado exitosamente:', [
                'filename' => $filename,
                'size' => strlen($pdf->output())
            ]);

            // Retornar el PDF como descarga
            return $pdf->download($filename);
            
        } catch (\Exception $e) {
            Log::error('❌ Error generando PDF de solicitud: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al generar archivo PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    // 🔧 MÉTODO DE PRUEBA - Generar PDF para testing
    public function testGenerarPDF($id)
    {
        try {
            Log::info('🧪 TEST: Generando PDF para solicitud ID: ' . $id);
            
            $result = $this->descargarPDF($id);
            
            if ($result->getStatusCode() === 200) {
                Log::info('✅ TEST EXITOSO: PDF generado correctamente');
                return response()->json([
                    'success' => true,
                    'message' => 'PDF generado correctamente en modo test'
                ]);
            } else {
                Log::error('❌ TEST FALLIDO: Error generando PDF');
                return response()->json([
                    'success' => false,
                    'message' => 'Error generando PDF en modo test'
                ], 500);
            }
            
        } catch (\Exception $e) {
            Log::error('❌ TEST EXCEPCIÓN: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Excepción en test de PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
