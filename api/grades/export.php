<?php
/**
 * Endpoint: GET /api/grades/export.php
 * Genera y descarga directamente reportes en Excel (.xls / .csv) o Word (.doc)
 * desde el servidor con encabezados Content-Disposition oficiales.
 */
require_once __DIR__ . '/../config/session.php';

$user = requireRole(['docente', 'admin']);
$db = getDB();

$format = strtolower($_GET['format'] ?? 'excel');
$actividadId = isset($_GET['actividad_id']) && $_GET['actividad_id'] !== 'all' ? (int)$_GET['actividad_id'] : 0;
$tipo = $_GET['tipo'] ?? 'all';
$estado = $_GET['estado'] ?? 'all';
$search = trim($_GET['search'] ?? '');
$dateFrom = $_GET['date_from'] ?? '';
$dateTo = $_GET['date_to'] ?? '';

// Construir consulta
$query = "
    SELECT 
        s.id,
        s.activity_id,
        s.estudiante_id,
        s.fecha_entrega AS entregado_en,
        s.estado,
        g.nota AS calificacion,
        g.retroalimentacion,
        u.nombre AS estudiante_nombre,
        u.apellido AS estudiante_apellido,
        u.email AS estudiante_email,
        a.titulo AS actividad_titulo,
        a.tipo AS actividad_tipo,
        a.nota_maxima
    FROM submissions s
    INNER JOIN users u ON u.id = s.estudiante_id
    INNER JOIN activities a ON a.id = s.activity_id
    LEFT JOIN grades g ON g.submission_id = s.id
";

$params = [];
$conditions = [];

if ($user['rol'] === 'docente') {
    $conditions[] = "a.docente_id = ?";
    $params[] = $user['id'];
}

if ($actividadId > 0) {
    $conditions[] = "s.activity_id = ?";
    $params[] = $actividadId;
}

if ($tipo !== 'all' && in_array($tipo, ['quiz', 'archivo', 'mixta'])) {
    $conditions[] = "a.tipo = ?";
    $params[] = $tipo;
}

if ($estado === 'calificada') {
    $conditions[] = "s.estado = 'calificada' AND g.nota IS NOT NULL";
} elseif ($estado === 'pendiente') {
    $conditions[] = "(s.estado != 'calificada' OR g.nota IS NULL)";
}

if (!empty($dateFrom)) {
    $conditions[] = "s.fecha_entrega >= ?";
    $params[] = $dateFrom . ' 00:00:00';
}

if (!empty($dateTo)) {
    $conditions[] = "s.fecha_entrega <= ?";
    $params[] = $dateTo . ' 23:59:59';
}

if (!empty($search)) {
    $conditions[] = "(u.nombre LIKE ? OR u.apellido LIKE ? OR u.email LIKE ? OR a.titulo LIKE ?)";
    $term = "%$search%";
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
}

if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

$query .= " ORDER BY s.fecha_entrega DESC";

$stmt = $db->prepare($query);
$stmt->execute($params);
$submissions = $stmt->fetchAll();

$dateStr = date('Y-m-d');
$teacherName = htmlspecialchars($user['nombre'] . ' ' . $user['apellido'], ENT_QUOTES, 'UTF-8');

function getEscala($nota) {
    if ($nota === null || $nota === '') return 'N/A';
    $n = (float)$nota;
    if ($n >= 9.0) return 'Domina los aprendizajes (DAR)';
    if ($n >= 7.0) return 'Alcanza los aprendizajes (AAR)';
    if ($n >= 4.01) return 'Próximo a alcanzar (PAAR)';
    return 'No alcanza los aprendizajes (NAAR)';
}

// Limpiar buffers
while (ob_get_level()) {
    ob_end_clean();
}

if ($format === 'csv') {
    $filename = "Reporte_Calificaciones_Lengua9no_{$dateStr}.csv";
    header('Content-Type: text/csv; charset=UTF-8');
    header("Content-Disposition: attachment; filename=\"{$filename}\"");
    
    // UTF-8 BOM
    echo "\xEF\xBB\xBF";
    $output = fopen('php://output', 'w');
    fputcsv($output, ['N°', 'ID Entrega', 'Estudiante', 'Correo Institucional', 'Actividad', 'Tipo', 'Fecha de Entrega', 'Calificación', 'Escala Cualitativa', 'Estado', 'Observaciones'], ';');

    foreach ($submissions as $idx => $s) {
        $hasGrade = $s['calificacion'] !== null;
        $nota = $hasGrade ? number_format((float)$s['calificacion'], 2, '.', '') : 'Sin Calificar';
        $estado = $hasGrade ? 'Calificada' : 'Pendiente';
        $escala = getEscala($s['calificacion']);

        fputcsv($output, [
            $idx + 1,
            $s['id'],
            $s['estudiante_nombre'] . ' ' . $s['estudiante_apellido'],
            $s['estudiante_email'],
            $s['actividad_titulo'],
            strtoupper($s['actividad_tipo']),
            $s['entregado_en'],
            $nota,
            $escala,
            $estado,
            $s['retroalimentacion'] ?? 'Sin observaciones'
        ], ';');
    }
    fclose($output);
    exit;

} elseif ($format === 'excel' || $format === 'xls') {
    // Excel XML Spreadsheet format (opens directly in MS Excel with columns, styles and formatting)
    $filename = "Reporte_Calificaciones_Lengua9no_{$dateStr}.xls";
    header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
    header("Content-Disposition: attachment; filename=\"{$filename}\"");

    echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    echo "<?mso-application progid=\"Excel.Sheet\"?>\n";
    ?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
      xmlns:html="http://www.w3.org/TR/REC-html40">
      <Styles>
        <Style ss:ID="Default" ss:Name="Normal">
          <Alignment ss:Vertical="Bottom"/>
          <Borders/>
          <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
        </Style>
        <Style ss:ID="Title">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Font ss:FontName="Calibri" ss:Size="14" ss:Color="#1E3A8A" ss:Bold="1"/>
        </Style>
        <Style ss:ID="Header">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
          </Borders>
          <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
          <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="DataCell">
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
          </Borders>
          <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
        </Style>
        <Style ss:ID="DataNumber">
          <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
          <Borders>
            <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
            <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
            <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
            <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
          </Borders>
          <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B" ss:Bold="1"/>
          <NumberFormat ss:Format="0.00"/>
        </Style>
      </Styles>
      <Worksheet ss:Name="Sábana de Calificaciones">
        <Table>
          <Column ss:Width="30"/>
          <Column ss:Width="60"/>
          <Column ss:Width="160"/>
          <Column ss:Width="170"/>
          <Column ss:Width="200"/>
          <Column ss:Width="70"/>
          <Column ss:Width="110"/>
          <Column ss:Width="80"/>
          <Column ss:Width="140"/>
          <Column ss:Width="80"/>
          <Column ss:Width="220"/>
          <Row ss:Height="25">
            <Cell ss:MergeAcross="10" ss:StyleID="Title">
              <Data ss:Type="String">UNIDAD EDUCATIVA FISCOMISIONAL SAN LORENZO - REPORTE DE CALIFICACIONES (9NO EGB)</Data>
            </Cell>
          </Row>
          <Row ss:Height="20">
            <Cell ss:StyleID="Header"><Data ss:Type="String">N°</Data></Cell>
            <Cell ss:StyleID="Header"><Data ss:Type="String">ID Entrega</Data></Cell>
            <Cell ss:StyleID="Header"><Data ss:Type="String">Estudiante</Data></Cell>
            <Cell ss:StyleID="Header"><Data ss:Type="String">Correo</Data></Cell>
            <Cell ss:StyleID="Header"><Data ss:Type="String">Actividad</Data></Cell>
            <Cell ss:StyleID="Header"><Data ss:Type="String">Tipo</Data></Cell>
            <Cell ss:StyleID="Header"><Data ss:Type="String">Fecha Entrega</Data></Cell>
            <Cell ss:StyleID="Header"><Data ss:Type="String">Nota /10</Data></Cell>
            <Cell ss:StyleID="Header"><Data ss:Type="String">Escala</Data></Cell>
            <Cell ss:StyleID="Header"><Data ss:Type="String">Estado</Data></Cell>
            <Cell ss:StyleID="Header"><Data ss:Type="String">Observaciones</Data></Cell>
          </Row>
          <?php foreach ($submissions as $idx => $s): 
            $hasGrade = $s['calificacion'] !== null;
            $nota = $hasGrade ? (float)$s['calificacion'] : 0;
            $estado = $hasGrade ? 'Calificada' : 'Pendiente';
            $escala = getEscala($s['calificacion']);
          ?>
          <Row>
            <Cell ss:StyleID="DataCell"><Data ss:Type="Number"><?= $idx + 1 ?></Data></Cell>
            <Cell ss:StyleID="DataCell"><Data ss:Type="Number"><?= $s['id'] ?></Data></Cell>
            <Cell ss:StyleID="DataCell"><Data ss:Type="String"><?= htmlspecialchars($s['estudiante_nombre'] . ' ' . $s['estudiante_apellido'], ENT_QUOTES, 'UTF-8') ?></Data></Cell>
            <Cell ss:StyleID="DataCell"><Data ss:Type="String"><?= htmlspecialchars($s['estudiante_email'], ENT_QUOTES, 'UTF-8') ?></Data></Cell>
            <Cell ss:StyleID="DataCell"><Data ss:Type="String"><?= htmlspecialchars($s['actividad_titulo'], ENT_QUOTES, 'UTF-8') ?></Data></Cell>
            <Cell ss:StyleID="DataCell"><Data ss:Type="String"><?= strtoupper($s['actividad_tipo']) ?></Data></Cell>
            <Cell ss:StyleID="DataCell"><Data ss:Type="String"><?= $s['entregado_en'] ?></Data></Cell>
            <?php if ($hasGrade): ?>
              <Cell ss:StyleID="DataNumber"><Data ss:Type="Number"><?= $nota ?></Data></Cell>
            <?php else: ?>
              <Cell ss:StyleID="DataCell"><Data ss:Type="String">Pendiente</Data></Cell>
            <?php endif; ?>
            <Cell ss:StyleID="DataCell"><Data ss:Type="String"><?= $escala ?></Data></Cell>
            <Cell ss:StyleID="DataCell"><Data ss:Type="String"><?= $estado ?></Data></Cell>
            <Cell ss:StyleID="DataCell"><Data ss:Type="String"><?= htmlspecialchars($s['retroalimentacion'] ?? 'Sin observaciones', ENT_QUOTES, 'UTF-8') ?></Data></Cell>
          </Row>
          <?php endforeach; ?>
        </Table>
      </Worksheet>
    </Workbook>
    <?php
    exit;

} elseif ($format === 'word' || $format === 'doc') {
    $filename = "Informe_Academico_Lengua9no_{$dateStr}.doc";
    header('Content-Type: application/msword; charset=UTF-8');
    header("Content-Disposition: attachment; filename=\"{$filename}\"");

    echo "\xEF\xBB\xBF"; // UTF-8 BOM
    ?>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset='utf-8'>
        <title>Informe Académico - Lengua y Literatura 9no EGB</title>
        <style>
            body { font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; color: #1e293b; margin: 2cm; }
            h1 { color: #1e3a8a; font-size: 16pt; text-align: center; margin-bottom: 4px; text-transform: uppercase; }
            h2 { color: #3b82f6; font-size: 13pt; text-align: center; margin-top: 0; margin-bottom: 20px; }
            .header-box { border: 2px solid #1e3a8a; background-color: #f1f5f9; padding: 12px; margin-bottom: 20px; }
            .header-grid { width: 100%; border-collapse: collapse; font-size: 10pt; }
            .header-grid td { padding: 4px 8px; }
            .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10pt; }
            .data-table th { background-color: #1e3a8a; color: #ffffff; padding: 8px 6px; border: 1px solid #1e3a8a; text-align: center; }
            .data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; }
            .signatures { width: 100%; margin-top: 60px; border-collapse: collapse; }
            .signatures td { width: 50%; text-align: center; padding: 20px 40px; }
            .sig-line { border-top: 1px solid #475569; width: 80%; margin: 0 auto 6px auto; }
        </style>
    </head>
    <body>
        <h1>UNIDAD EDUCATIVA FISCOMISIONAL SAN LORENZO</h1>
        <h2>INFORME Y SÁBANA DE CALIFICACIONES - LENGUA Y LITERATURA 9º EGB</h2>

        <div class="header-box">
            <table class="header-grid">
                <tr>
                    <td><strong>Docente:</strong> <?= $teacherName ?></td>
                    <td><strong>Fecha de Emisión:</strong> <?= date('d/m/Y') ?></td>
                </tr>
                <tr>
                    <td><strong>Asignatura:</strong> Lengua y Literatura</td>
                    <td><strong>Año de Educación:</strong> Noveno Grado EGB</td>
                </tr>
                <tr>
                    <td><strong>Período Lectivo:</strong> 2026 - Régimen Escolar</td>
                    <td><strong>Total Evaluaciones:</strong> <?= count($submissions) ?> entregas</td>
                </tr>
            </table>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width:4%;">#</th>
                    <th style="width:24%;">Estudiante</th>
                    <th style="width:26%;">Actividad / Tarea</th>
                    <th style="width:14%;">Fecha Entrega</th>
                    <th style="width:9%;">Nota /10</th>
                    <th style="width:11%;">Cualitativa</th>
                    <th style="width:12%;">Observaciones</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($submissions as $idx => $s): 
                    $hasGrade = $s['calificacion'] !== null;
                    $nota = $hasGrade ? number_format((float)$s['calificacion'], 2) : 'Pendiente';
                    $escala = getEscala($s['calificacion']);
                ?>
                <tr style="background-color:<?= $idx % 2 === 0 ? '#ffffff' : '#f8fafc' ?>;">
                    <td style="text-align:center;"><?= $idx + 1 ?></td>
                    <td><strong><?= htmlspecialchars($s['estudiante_nombre'] . ' ' . $s['estudiante_apellido']) ?></strong><br><small style="color:#64748b;"><?= htmlspecialchars($s['estudiante_email']) ?></small></td>
                    <td><?= htmlspecialchars($s['actividad_titulo']) ?><br><span style="font-size:9px; color:#475569;">[<?= strtoupper($s['actividad_tipo']) ?>]</span></td>
                    <td style="text-align:center;"><?= $s['entregado_en'] ?></td>
                    <td style="text-align:center; font-weight:bold;"><?= $nota ?></td>
                    <td style="text-align:center; font-size:10px;"><?= $escala ?></td>
                    <td style="font-size:10px;"><?= htmlspecialchars($s['retroalimentacion'] ?? 'Sin observaciones') ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <table class="signatures">
            <tr>
                <td>
                    <div class="sig-line"></div>
                    <strong><?= $teacherName ?></strong><br>
                    Docente de Lengua y Literatura
                </td>
                <td>
                    <div class="sig-line"></div>
                    <strong>Rectorado / Inspección General</strong><br>
                    U.E.F. San Lorenzo
                </td>
            </tr>
        </table>
    </body>
    </html>
    <?php
    exit;
} else {
    // Por defecto exportar a Excel XML
    header("Location: /api/grades/export.php?format=excel");
    exit;
}
