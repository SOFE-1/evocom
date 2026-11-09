<?php

namespace App\Support;

final class TextPdf
{
    /**
     * @param  list<string>  $lines
     */
    public static function render(string $title, array $lines): string
    {
        $pages = array_chunk($lines, 42);
        if ($pages === []) {
            $pages = [[]];
        }

        $body = [
            1 => '<< /Type /Catalog /Pages 2 0 R >>',
            3 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];
        $pageIds = [];
        $next = 4;

        foreach ($pages as $index => $pageLines) {
            $stream = self::pageStream($title, $pageLines, $index + 1, count($pages));
            $contentId = $next++;
            $pageId = $next++;
            $body[$contentId] = '<< /Length '.strlen($stream)." >>\nstream\n{$stream}\nendstream";
            $body[$pageId] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents {$contentId} 0 R /Resources << /Font << /F1 3 0 R >> >> >>";
            $pageIds[] = $pageId;
        }

        $kids = implode(' ', array_map(fn (int $id) => "{$id} 0 R", $pageIds));
        $body[2] = '<< /Type /Pages /Count '.count($pageIds)." /Kids [ {$kids} ] >>";
        ksort($body);

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        $max = max(array_keys($body));
        foreach ($body as $id => $object) {
            $offsets[$id] = strlen($pdf);
            $pdf .= "{$id} 0 obj\n{$object}\nendobj\n";
        }

        $xref = strlen($pdf);
        $size = $max + 1;
        $pdf .= "xref\n0 {$size}\n";
        $pdf .= "0000000000 65535 f \n";
        for ($id = 1; $id < $size; $id++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$id] ?? 0);
        }
        $pdf .= "trailer << /Size {$size} /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";

        return $pdf;
    }

    /**
     * @param  list<string>  $lines
     */
    private static function pageStream(string $title, array $lines, int $page, int $pages): string
    {
        $commands = ["BT", "/F1 15 Tf", "48 800 Td", self::text($title).' Tj', '/F1 10 Tf'];
        $heading = $page > 1 ? "Page {$page} of {$pages}" : '';
        if ($heading !== '') {
            $commands[] = '0 -16 Td '.self::text($heading).' Tj';
        }
        foreach ($lines as $line) {
            $commands[] = '0 -14 Td '.self::text($line).' Tj';
        }
        $commands[] = 'ET';

        return implode("\n", $commands);
    }

    private static function text(string $value): string
    {
        $value = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $value);
        $value = preg_replace('/[^\x20-\x7E]/', ' ', $value) ?? $value;

        return '('.$value.')';
    }
}
