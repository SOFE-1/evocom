<?php

namespace App\Support;

use App\Models\QuoteCharge;
use App\Models\QuoteRequest;

final class QuotationDocument
{
    public static function render(QuoteRequest $quote): string
    {
        $quote->loadMissing(['items', 'charges']);
        $company = config('evocom.company');
        $validDays = (int) config('evocom.quote_valid_days', 15);
        $quotedOn = $quote->statusEvents()
            ->where('to_status', QuoteRequest::QUOTED)
            ->latest()
            ->first()
            ?->created_at ?? $quote->updated_at;
        $quotedOn = $quotedOn?->timezone(config('app.timezone'));
        $validUntil = $quotedOn?->copy()->addDays($validDays);

        $lines = [
            (string) ($company['address'] ?? ''),
            'Phone '.($company['phone'] ?? '').'    Email '.($company['email'] ?? ''),
            '',
            'QUOTATION',
            'Reference: '.$quote->reference_code,
            'Quotation date: '.($quotedOn?->toDateString() ?? ''),
            'Valid until: '.($validUntil?->toDateString() ?? ''),
            '',
            'Customer: '.$quote->customer_name,
            'Email: '.$quote->customer_email,
            'Phone: '.$quote->customer_phone,
            'Location: '.$quote->location,
            '',
            'PRODUCTS',
        ];

        if ($quote->items->isEmpty()) {
            $lines[] = 'No cameras on this quotation.';
        }

        $productSubtotal = '0.00';
        foreach ($quote->items as $item) {
            $line = $item->final_unit_price === null
                ? '0.00'
                : Money::mul((string) $item->final_unit_price, $item->quantity);
            $productSubtotal = Money::add($productSubtotal, $line);
            $lines[] = sprintf(
                '%s    Qty %s    %s each    %s',
                $item->product_name,
                $item->quantity,
                self::peso($item->final_unit_price),
                self::peso($line),
            );
        }
        $lines[] = 'Product subtotal: '.self::peso($productSubtotal);
        $lines[] = '';
        $lines[] = 'LABOR AND MATERIALS INCLUDED IN THE TOTAL';

        $chargeSubtotal = '0.00';
        $finalCharges = $quote->charges->where('finalized', true);
        if ($finalCharges->isEmpty()) {
            $lines[] = 'None.';
        }
        foreach ($finalCharges as $charge) {
            $line = Money::mul((string) $charge->unit_price, (string) $charge->quantity);
            $chargeSubtotal = Money::add($chargeSubtotal, $line);
            $lines[] = self::chargeLine($charge, $line);
        }
        $lines[] = 'Labor and materials subtotal: '.self::peso($chargeSubtotal);
        $lines[] = '';
        $lines[] = 'ESTIMATES (not included in the total until finalized after inspection)';

        $estimates = $quote->charges->where('finalized', false);
        if ($estimates->isEmpty()) {
            $lines[] = 'None.';
        }
        foreach ($estimates as $charge) {
            $price = $charge->unit_price === null ? 'price not set' : self::peso($charge->unit_price);
            $lines[] = sprintf(
                '%s - %s    Qty %s    %s    ESTIMATE',
                $charge->category,
                $charge->description,
                self::qty($charge->quantity),
                $price,
            );
        }

        $lines[] = '';
        $lines[] = 'TOTAL QUOTATION AMOUNT: '.self::peso($quote->quoted_total);
        $percent = (int) $quote->down_payment_percent;
        $lines[] = '';
        $lines[] = 'PAYMENT TERMS';
        $lines[] = "A {$percent}% down payment is required before installation is scheduled.";
        $lines[] = 'The remaining balance is due before the job is marked complete.';
        $lines[] = 'The warranty starts only after the job is completed and the balance is paid.';
        $lines[] = "This quotation is valid for {$validDays} days from the quotation date.";
        $lines[] = 'Cable lengths and material quantities are not assumed. Estimates can change after the site inspection.';

        return TextPdf::render((string) ($company['name'] ?? 'Quotation'), $lines);
    }

    private static function chargeLine(QuoteCharge $charge, string $line): string
    {
        return sprintf(
            '%s - %s    Qty %s    %s each    %s',
            $charge->category,
            $charge->description,
            self::qty($charge->quantity),
            self::peso($charge->unit_price),
            self::peso($line),
        );
    }

    private static function qty(mixed $quantity): string
    {
        $value = number_format((float) $quantity, 2, '.', '');

        return str_ends_with($value, '.00') ? (string) (int) $value : $value;
    }

    private static function peso(mixed $amount): string
    {
        if ($amount === null || $amount === '') {
            return 'PHP 0.00';
        }

        return 'PHP '.number_format((float) $amount, 2, '.', ',');
    }
}
