<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TblSolicitud;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ExcelSolicitudController extends Controller
{
    public function generarExcelSolicitudAprobada($id, Request $request)
    {
        try {
            Log::info('🔄 Iniciando generación de Excel para solicitud ID: ' . $id);
            
            // Obtener datos de la solicitud aprobada con todas las relaciones necesarias
            $solicitud = TblSolicitud::with([
                'empleados.elementos.elemento', // ✅ Incluir la relación con el elemento
                'empresa',
                'sede', 
                'usuario'
            ])->find($id);
            
            // 🔍 DEBUG: Verificar que las relaciones se cargaron correctamente
            if ($solicitud && $solicitud->empleados) {
                foreach ($solicitud->empleados as $empIndex => $empleado) {
                    Log::info("🔍 DEBUG Empleado {$empIndex}:", [
                        'id' => $empleado->idDetalleSolicitud,
                        'nombre' => $empleado->nombreEmpleado,
                        'elementos_loaded' => $empleado->relationLoaded('elementos'),
                        'elementos_count' => $empleado->elementos ? count($empleado->elementos) : 0
                    ]);
                    
                    if ($empleado->elementos) {
                        foreach ($empleado->elementos as $elIndex => $elemento) {
                            Log::info("  🔍 DEBUG Elemento {$elIndex}:", [
                                'idDetalleSolicitudElementos' => $elemento->idDetalleSolicitudElementos,
                                'idElemento' => $elemento->idElemento,
                                'elemento_relation_loaded' => $elemento->relationLoaded('elemento'),
                                'elemento_object' => $elemento->elemento ? 'EXISTE' : 'NULL',
                                'nombreElemento' => $elemento->elemento ? $elemento->elemento->nombreElemento : 'NO RELACIONADO',
                                'raw_data' => $elemento->toArray()
                            ]);
                        }
                    }
                }
            }
            
            if (!$solicitud) {
                Log::error('❌ Solicitud no encontrada con ID: ' . $id);
                return response()->json(['error' => 'Solicitud no encontrada'], 404);
            }
            
            Log::info('📋 Solicitud encontrada:', [
                'id' => $solicitud->id,
                'codigo' => $solicitud->codigoSolicitud,
                'empleados_count' => $solicitud->empleados ? count($solicitud->empleados) : 0,
                'empresa' => $solicitud->empresa ? $solicitud->empresa->NombreEmpresa : 'N/A',
                'sede' => $solicitud->sede ? $solicitud->sede->NombreSede : 'N/A',
                'usuario' => $solicitud->usuario ? $solicitud->usuario->NombresUsuarioAutorizado : 'N/A'
            ]);
            
            // Log de debug para empleados y elementos
            if ($solicitud->empleados) {
                foreach ($solicitud->empleados as $index => $empleado) {
                    Log::info("👤 Empleado {$index}:", [
                        'nombre' => $empleado->nombreEmpleado,
                        'documento' => $empleado->documentoEmpleado,
                        'elementos_count' => $empleado->elementos ? count($empleado->elementos) : 0
                    ]);
                    
                    if ($empleado->elementos) {
                        foreach ($empleado->elementos as $elIndex => $elemento) {
                            Log::info("  📦 Elemento {$elIndex}:", [
                                'idElemento' => $elemento->idElemento,
                                'nombreElemento' => $elemento->elemento ? $elemento->elemento->nombreElemento : 'NO RELACIONADO',
                                'talla' => $elemento->TallaElemento,
                                'cantidad' => $elemento->Cantidad
                            ]);
                        }
                    }
                }
            }

            // Crear nuevo spreadsheet
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            
            // Configurar título principal
            $sheet->setCellValue('A1', 'SOLICITUD DE DOTACIÓN APROBADA');
            $sheet->mergeCells('A1:G1');
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
            $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            
            // Información de la solicitud
            $sheet->setCellValue('A3', 'Código:');
            $sheet->setCellValue('B3', $solicitud->codigoSolicitud ?? 'N/A');
            $sheet->setCellValue('D3', 'Fecha:');
            $sheet->setCellValue('E3', now()->format('d/m/Y'));
            
            $sheet->setCellValue('A4', 'Empresa:');
            $sheet->setCellValue('B4', $solicitud->empresa ? $solicitud->empresa->NombreEmpresa : 'N/A');
            $sheet->setCellValue('D4', 'Sede:');
            $sheet->setCellValue('E4', $solicitud->sede ? $solicitud->sede->NombreSede : 'N/A');
            
            $sheet->setCellValue('A5', 'Solicitante:');
            $sheet->setCellValue('B5', $solicitud->usuario ? $solicitud->usuario->NombresUsuarioAutorizado : 'N/A');
            
            // Encabezados de la tabla
            $headers = [
                'A7' => 'Empleado',
                'B7' => 'Documento',
                'C7' => 'Elemento',
                'D7' => 'Talla',
                'E7' => 'Cantidad Solicitada',
                'F7' => 'Cantidad Aprobada',
                'G7' => 'Observación'
            ];
            
            foreach ($headers as $cell => $value) {
                $sheet->setCellValue($cell, $value);
                $sheet->getStyle($cell)->getFont()->setBold(true);
                $sheet->getStyle($cell)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E2E8F0');
                $sheet->getStyle($cell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }
            
            // Llenar datos
            $row = 8;
            foreach ($solicitud->empleados as $empleado) {
                foreach ($empleado->elementos as $elemento) {
                    // 🔍 Obtener el nombre del elemento con fallback
                    $nombreElemento = 'Elemento no encontrado';
                    
                    if ($elemento->elemento) {
                        $nombreElemento = $elemento->elemento->nombreElemento;
                    } else {
                        // Fallback: Intentar obtener el elemento directamente
                        try {
                            $elementoDirecto = \App\Models\TblElemento::find($elemento->idElemento);
                            if ($elementoDirecto) {
                                $nombreElemento = $elementoDirecto->nombreElemento;
                                Log::info("✅ Elemento obtenido directamente:", [
                                    'idElemento' => $elemento->idElemento,
                                    'nombreElemento' => $nombreElemento
                                ]);
                            } else {
                                Log::warning("⚠️ Elemento no encontrado en BD:", [
                                    'idElemento' => $elemento->idElemento
                                ]);
                            }
                        } catch (\Exception $e) {
                            Log::error("❌ Error obteniendo elemento directamente:", [
                                'idElemento' => $elemento->idElemento,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                    
                    $sheet->setCellValue('A' . $row, $empleado->nombreEmpleado);
                    $sheet->setCellValue('B' . $row, $empleado->documentoEmpleado);
                    $sheet->setCellValue('C' . $row, $nombreElemento);
                    $sheet->setCellValue('D' . $row, $elemento->TallaElemento);
                    $sheet->setCellValue('E' . $row, $elemento->Cantidad);
                    $sheet->setCellValue('F' . $row, $elemento->cantidadModificada ?? $elemento->Cantidad);
                    $sheet->setCellValue('G' . $row, $elemento->observacionElemento ?? '');
                    
                    // Resaltar filas con modificaciones
                    if (($elemento->cantidadModificada ?? $elemento->Cantidad) < $elemento->Cantidad) {
                        $sheet->getStyle('A' . $row . ':G' . $row)->getFill()
                              ->setFillType(Fill::FILL_SOLID)
                              ->getStartColor()->setRGB('FEF3C7');
                    }
                    
                    $row++;
                }
            }
            
            // Auto-ajustar columnas con un ancho mínimo
            $columnWidths = [
                'A' => 25, // Empleado
                'B' => 15, // Documento
                'C' => 30, // Elemento
                'D' => 10, // Talla
                'E' => 20, // Cantidad Solicitada
                'F' => 20, // Cantidad Aprobada
                'G' => 25  // Observación
            ];
            
            foreach ($columnWidths as $col => $width) {
                $sheet->getColumnDimension($col)->setWidth($width);
            }
            
            // Aplicar bordes a la tabla
            $lastRow = $row - 1;
            $sheet->getStyle('A7:G' . $lastRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            
            // Generar archivo
            $writer = new Xlsx($spreadsheet);
            $filename = 'Solicitud_Aprobada_' . ($solicitud->codigoSolicitud ?? 'SIN_CODIGO') . '_' . date('Y-m-d_H-i-s') . '.xlsx';
            
            // Crear directorio si no existe
            $directory = storage_path('app/public/excel');
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }
            
            // Guardar archivo
            $path = $directory . '/' . $filename;
            $writer->save($path);
            
            // Verificar que el archivo se guardó
            if (!file_exists($path)) {
                Log::error('❌ El archivo Excel no se guardó correctamente en: ' . $path);
                throw new \Exception('Error al guardar archivo Excel');
            }
            
            Log::info('✅ Archivo Excel guardado exitosamente:', [
                'path' => $path,
                'size' => filesize($path),
                'filename' => $filename
            ]);
            
            // Limpiar memoria
            $spreadsheet->disconnectWorksheets();
            unset($spreadsheet);
            
            $response = [
                'success' => true,
                'filename' => $filename,
                'download_url' => Storage::url('excel/' . $filename),
                'file_path' => $path
            ];
            
            Log::info('📊 Respuesta de generación Excel:', $response);
            
            return response()->json($response);
            
        } catch (\Exception $e) {
            Log::error('Error generando Excel de solicitud: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Error al generar archivo Excel: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function descargarExcel($id)
    {
        try {
            Log::info('🔄 Iniciando descarga de Excel para solicitud ID: ' . $id);
            
            $solicitud = TblSolicitud::find($id);
            if (!$solicitud) {
                Log::error('❌ Solicitud no encontrada con ID: ' . $id);
                return response()->json(['error' => 'Solicitud no encontrada'], 404);
            }
            
            // Buscar archivos Excel existentes para esta solicitud
            $directory = storage_path('app/public/excel');
            $pattern = 'Solicitud_Aprobada_' . $solicitud->codigoSolicitud . '_*.xlsx';
            $files = glob($directory . '/' . $pattern);
            
            if (empty($files)) {
                Log::error('❌ No se encontraron archivos Excel para la solicitud: ' . $solicitud->codigoSolicitud);
                return response()->json(['error' => 'Archivo Excel no encontrado'], 404);
            }
            
            // Usar el archivo más reciente
            $latestFile = end($files);
            $filename = basename($latestFile);
            
            Log::info('📁 Archivo Excel encontrado:', [
                'filename' => $filename,
                'path' => $latestFile,
                'size' => filesize($latestFile)
            ]);
            
            return response()->download($latestFile, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"'
            ]);
            
        } catch (\Exception $e) {
            Log::error('❌ Error descargando Excel: ' . $e->getMessage());
            return response()->json(['error' => 'Error al descargar archivo'], 500);
        }
    }

    // 🔧 MÉTODO DE PRUEBA - Generar Excel para testing
    public function testGenerarExcel($id)
    {
        try {
            Log::info('🧪 TEST: Generando Excel para solicitud ID: ' . $id);
            
            $result = $this->generarExcelSolicitudAprobada($id, new Request());
            
            if ($result->getData()->success) {
                Log::info('✅ TEST EXITOSO: Excel generado correctamente');
                return response()->json([
                    'success' => true,
                    'message' => 'Excel generado correctamente en modo test',
                    'data' => $result->getData()
                ]);
            } else {
                Log::error('❌ TEST FALLIDO: Error generando Excel');
                return response()->json([
                    'success' => false,
                    'message' => 'Error generando Excel en modo test',
                    'error' => $result->getData()
                ], 500);
            }
            
        } catch (\Exception $e) {
            Log::error('❌ TEST EXCEPCIÓN: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Excepción en test de Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
