<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class userAuth extends Controller
{/**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(Request $request)
    {
        // Store the app's deep link URL in session if provided
        if ($request->has('redirect_url')) {
            session(['mobile_redirect_url' => $request->query('redirect_url')]);
        }

        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Obtain the user information from Google and redirect back to the app.
     */
    public function handleGoogleCallback(Request $request)
    {
        // Retrieve Google user using stateless mode
        $googleUser = Socialite::driver('google')->stateless()->user();

        // Find existing user or create a new one
        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'password' => null, // Assign random secure password
            ]
        );

        // Update google_id if user existed prior to Google sign-in
        if (!$user->google_id) {
            $user->update(['google_id' => $googleUser->getId()]);
        }

        // Generate Sanctum API token
        $token = $user->createToken('api_token')->plainTextToken;

       // Retrieve saved target URL (Defaults to mobile scheme, falls back to web dev server)
        $defaultRedirect = config('app.env') === 'local' 
            ? 'http://localhost:8081/auth-callback' 
            : 'myapp://auth-callback';

        $redirectUrl = session()->pull('auth_redirect_url',$defaultRedirect);

        // Redirect back to either the web page or mobile app
        return redirect()->away($redirectUrl . '?token=' . $token);
       }
}
