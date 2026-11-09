<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\QuoteRequest;
use App\Models\QuoteStatusEvent;
use App\Support\Money;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesReportController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $data = $request->validate([
            'year' => ['nullable', 'integer', 'min:2020', 'max:2100'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        $year = (int) ($data['year'] ?? now()->year);
        $month = (int) ($data['month'] ?? now()->month);

        $payments = Payment::query()
            ->with('quoteRequest')
            ->whereYear('paid_on', $year)
            ->whereMonth('paid_on', $month)
            ->orderBy('paid_on')
            ->orderBy('id')
            ->get();

        $collected = '0.00';
        $rows = [];
        foreach ($payments as $payment) {
            $amount = Money::normalize((string) $payment->amount);
            $collected = Money::add($collected, $amount);
            $rows[] = [
                'id' => $payment->id,
                'paid_on' => $payment->paid_on?->toDateString(),
                'amount' => $amount,
                'method' => $payment->method,
                'reference_code' => $payment->quoteRequest?->reference_code,
                'customer_name' => $payment->quoteRequest?->customer_name,
            ];
        }

        $quotedIds = QuoteStatusEvent::query()
            ->where('to_status', QuoteRequest::QUOTED)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->pluck('quote_request_id')
            ->unique();

        $outstanding = '0.00';
        $openQuotes = QuoteRequest::query()
            ->with('payments')
            ->whereIn('id', $quotedIds)
            ->where('status', '!=', QuoteRequest::CANCELLED)
            ->get();

        foreach ($openQuotes as $quote) {
            $balance = $quote->paymentSnapshot()['balance_remaining'];
            if ($balance !== null && Money::compare($balance, '0') > 0) {
                $outstanding = Money::add($outstanding, $balance);
            }
        }

        $completed = QuoteStatusEvent::query()
            ->where('to_status', QuoteRequest::COMPLETED)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->distinct()
            ->count('quote_request_id');

        return response()->json([
            'data' => [
                'year' => $year,
                'month' => $month,
                'total_sales' => $collected,
                'payments_received' => $collected,
                'outstanding_balances' => $outstanding,
                'completed_jobs' => $completed,
                'transactions' => $payments->count(),
                'payments' => $rows,
            ],
        ]);
    }
}
