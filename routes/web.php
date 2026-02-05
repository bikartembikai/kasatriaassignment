<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return view('login');
})->name('login');

Route::get('/auth/google', [\App\Http\Controllers\AuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [\App\Http\Controllers\AuthController::class, 'callback']);
Route::get('/logout', function () {
    Auth::logout();
    return redirect('/login');
})->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::get('/visualization', function () {
        return view('visualization');
    });

    Route::get('/api/sheet-data', [\App\Http\Controllers\DataController::class, 'fetchData']);
});

