<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class userAuth extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(Request $request)
    {
        $redirectUrl = $request->input('redirect_url') ?? $request->query('redirect_url');

        if ($redirectUrl) {
            session()->put('auth_redirect_url', $redirectUrl);
            session()->put('mobile_redirect_url', $redirectUrl);
        }

        $redirect = Socialite::driver('google')->stateless()->redirect();

        return $redirect;
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
                'password' => null,
            ]
        );

        // Update google_id if user existed prior to Google sign-in
        if (!$user->google_id) {
            $user->update(['google_id' => $googleUser->getId()]);
        }

        // Generate Sanctum API token
        $token = $user->createToken('api_token')->plainTextToken;

        $defaultRedirect = app()->environment('local')
            ? 'https://ai-chatbot-ten-murex.vercel.app/auth-callback'
            : 'chatbotfrontend://auth-callback';

        $redirectUrl = $request->query('redirect_url')
            ?? session()->pull('auth_redirect_url', session()->pull('mobile_redirect_url', $defaultRedirect));

        if (empty($redirectUrl)) {
            $redirectUrl = $defaultRedirect;
        }
        // $redirectUrl = session()->pull('auth_redirect_url',$defaultRedirect);
        // Redirect back to either the web page or mobile app
        // return redirect()->away($redirectUrl . '?token=' . $token);
        $callbackUrl = $this->buildCallbackUrl($redirectUrl, $token);

        return redirect()->away($callbackUrl);
    }

    protected function buildCallbackUrl(string $redirectUrl, string $token): string
    {
        $cleanUrl = rtrim($redirectUrl, '?&');
        $separator = str_contains($cleanUrl, '?') ? '&' : '?';

        return $cleanUrl . $separator . 'token=' . urlencode($token);
    }
}
