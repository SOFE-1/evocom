<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuoteDetailResource;
use App\Http\Resources\ScheduleResource;
use App\Models\QuoteRequest;
use App\Models\ScheduleEvent;
use App\Models\Technician;
use App\Services\QuoteDetailLoader;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class ScheduleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        $events = ScheduleEvent::query()
            ->with(['technician', 'quoteRequest'])
            ->when(isset($data['from']), fn ($query) => $query->where('starts_at', '>=', $data['from']))
            ->when(isset($data['to']), fn ($query) => $query->where('starts_at', '<=', $data['to']))
            ->orderBy('starts_at')
            ->get();

        return ScheduleResource::collection($events);
    }

    public function store(Request $request, QuoteRequest $quote, QuoteDetailLoader $details): QuoteDetailResource
    {
        $data = $request->validate([
            'technician_id' => ['required', 'integer', 'exists:technicians,id'],
            'event_type' => ['required', 'in:'.ScheduleEvent::OCULAR.','.ScheduleEvent::INSTALLATION],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $technician = Technician::query()->whereKey($data['technician_id'])->where('is_active', true)->first();

        if ($technician === null) {
            throw ValidationException::withMessages([
                'technician_id' => 'Choose an active technician.',
            ]);
        }

        $quote->schedules()->create([
            'technician_id' => $technician->id,
            'event_type' => $data['event_type'],
            'starts_at' => $data['starts_at'],
            'ends_at' => $data['ends_at'],
            'notes' => $data['notes'] ?? null,
        ]);

        $quote->assigned_technician_id = $technician->id;
        $quote->save();

        return new QuoteDetailResource($details->load($quote));
    }

    public function destroy(ScheduleEvent $schedule): JsonResponse
    {
        $schedule->delete();

        return response()->json(['message' => 'Schedule removed.']);
    }
}
