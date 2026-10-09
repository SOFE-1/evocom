<?php

namespace App\Exceptions;

use RuntimeException;

class InvalidStatusTransition extends RuntimeException
{
    public function __construct(public readonly string $from, public readonly string $to)
    {
        parent::__construct("A request cannot move from {$from} to {$to}.");
    }
}
