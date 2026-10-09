<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TechnicianResource;
use App\Models\Technician;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TechnicianController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $technicians = Technician::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return TechnicianResource::collection($technicians);
    }

    public function store(Request $request): TechnicianResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:160'],
            'specialty' => ['nullable', 'string', 'max:160'],
        ]);

        $technician = Technician::query()->create([
            ...$data,
            'is_active' => true,
        ]);

        return new TechnicianResource($technician);
    }
}
