<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->scopes(['https://www.googleapis.com/auth/spreadsheets.readonly'])
            ->with(['access_type' => 'offline', 'prompt' => 'consent'])
            ->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                    'password' => bcrypt('123456dummy') // Required if password is not nullable
                ]
            );

            Auth::login($user);

            return redirect('/visualization');
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Login failed: ' . $e->getMessage());
        }
    }
}
