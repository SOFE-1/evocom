<?php

use App\Http\Controllers\Admin\NoteController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\QuoteController as AdminQuoteController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\TechnicianController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\QuoteIntakeController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);
Route::post('/quotes', [QuoteIntakeController::class, 'store'])->middleware('throttle:20,1');

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/quotes', [AdminQuoteController::class, 'index']);
        Route::get('/quotes/{quote}', [AdminQuoteController::class, 'show']);
        Route::patch('/quotes/{quote}/status', [AdminQuoteController::class, 'updateStatus']);
        Route::put('/quotes/{quote}/pricing', [AdminQuoteController::class, 'updatePricing']);
        Route::post('/quotes/{quote}/payment', [AdminQuoteController::class, 'recordPayment']);
        Route::post('/quotes/{quote}/notes', [NoteController::class, 'store']);

        Route::get('/schedules', [ScheduleController::class, 'index']);
        Route::post('/quotes/{quote}/schedules', [ScheduleController::class, 'store']);
        Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy']);

        Route::get('/technicians', [TechnicianController::class, 'index']);
        Route::post('/technicians', [TechnicianController::class, 'store']);

        Route::get('/products', [AdminProductController::class, 'index']);
        Route::post('/products', [AdminProductController::class, 'store']);
        Route::put('/products/{product}', [AdminProductController::class, 'update']);
    });
});
