<?php
// A zene/ mappában (és almappáiban) lévő hangfájlok listája JSON-ban.
// Saját tárhelyen így elég FTP-vel feltölteni a zenéket a zene/ mappába.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');

$base = __DIR__ . '/zene';
$exts = ['mp3', 'm4a', 'ogg', 'wav', 'flac', 'aac'];
$files = [];

if (is_dir($base)) {
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS)
    );
    foreach ($it as $file) {
        if ($file->isFile() && in_array(strtolower($file->getExtension()), $exts, true)) {
            $rel = substr($file->getPathname(), strlen(__DIR__) + 1);
            $files[] = str_replace(DIRECTORY_SEPARATOR, '/', $rel);
        }
    }
}

sort($files, SORT_NATURAL | SORT_FLAG_CASE);
echo json_encode($files, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
