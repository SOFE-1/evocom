<?php

namespace App\Support;

final class Money
{
    public static function mul(string|int|float $amount, string|int|float $quantity): string
    {
        return bcmul(self::normalize($amount), self::normalize($quantity), 2);
    }

    public static function add(string $left, string $right): string
    {
        return bcadd($left, $right, 2);
    }

    public static function sub(string $left, string $right): string
    {
        return bcsub(self::normalize($left), self::normalize($right), 2);
    }

    public static function compare(string $left, string $right): int
    {
        return bccomp(self::normalize($left), self::normalize($right), 2);
    }

    public static function percent(string $amount, int $percent): string
    {
        return bcmul($amount, bcdiv((string) $percent, '100', 4), 2);
    }

    public static function normalize(string|int|float $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }
}
