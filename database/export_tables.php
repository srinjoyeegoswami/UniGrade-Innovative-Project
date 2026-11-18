<?php
/**
 * Export all MySQL tables in unigrade_db to CSV files for Excel / Report
 */
require_once __DIR__ . '/../backend/config/database.php';

$exportDir = __DIR__ . '/exports';
if (!is_dir($exportDir)) {
    mkdir($exportDir, 0777, true);
}

try {
    $db = Database::getInstance();
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    echo "Exporting tables to: $exportDir\n\n";

    foreach ($tables as $t) {
        $rows = $db->query("SELECT * FROM `$t`")->fetchAll(PDO::FETCH_ASSOC);
        $csvFile = "$exportDir/{$t}.csv";
        $fp = fopen($csvFile, 'w');

        if (!empty($rows)) {
            // Write headers
            fputcsv($fp, array_keys($rows[0]));
            // Write rows
            foreach ($rows as $row) {
                fputcsv($fp, $row);
            }
        } else {
            // Write empty header from column names
            $cols = $db->query("DESCRIBE `$t`")->fetchAll(PDO::FETCH_COLUMN);
            fputcsv($fp, $cols);
        }

        fclose($fp);
        echo "✓ Exported: {$t}.csv (" . count($rows) . " rows)\n";
    }

    echo "\n=== ALL TABLES SUCCESSFULLY EXPORTED TO CSV! ===\n";

} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
