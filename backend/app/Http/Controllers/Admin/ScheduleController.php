<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\QuoteDetailResource;
use App\Http\Resources\ScheduleResource;
use App\Models\QuoteRequest;
use App\Models\ScheduleEvent;
use App\Models\Technician;
use App\Services\QuoteDetailLoader;
use App\Services\StatusStateEngine;
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
            ->whereNull('cancelled_at')
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

        if (now()->parse($data['starts_at'])->lt(now())) {
            throw ValidationException::withMessages([
                'starts_at' => 'Choose a visit time that has not already passed.',
            ]);
        }

        $overlap = ScheduleEvent::query()
            ->where('technician_id', $technician->id)
            ->whereNull('cancelled_at')
            ->where('starts_at', '<', $data['ends_at'])
            ->where('ends_at', '>', $data['starts_at'])
            ->exists();

        if ($overlap) {
            throw ValidationException::withMessages([
                'technician_id' => $technician->name.' already has a visit in that time. Choose another technician or another time.',
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

    public function destroy(
        Request $request,
        ScheduleEvent $schedule,
        StatusStateEngine $statuses,
        QuoteDetailLoader $details,
    ): QuoteDetailResource {
        if ($schedule->cancelled_at !== null) {
            throw ValidationException::withMessages([
                'schedule' => 'This visit is already cancelled.',
            ]);
        }

        $schedule->cancelled_at = now();
        $schedule->cancelled_by = $request->user()?->id;
        $schedule->save();

        $quote = $schedule->quoteRequest()->firstOrFail();
        $active = $quote->schedules()->whereNull('cancelled_at')->orderByDesc('starts_at')->get();
        $quote->assigned_technician_id = $active->first()?->technician_id;

        $activeInstallation = $active->contains(
            fn (ScheduleEvent $event) => $event->event_type === ScheduleEvent::INSTALLATION,
        );

        if (! $activeInstallation && $quote->status === QuoteRequest::SCHEDULED) {
            $quote->installation_start_date = null;
            $quote->installation_end_date = null;
            $quote->save();
            $statuses->transition($quote, QuoteRequest::AWAITING_PAYMENT, $request->user());
        } else {
            $quote->save();
        }

        return new QuoteDetailResource($details->load($quote->refresh()));
    }
}
