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
    public function redirectToGoogle(Request $request)
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Display the specified resource.
     */
    public function handleGoogleCallback(Request $request)
    {
        $googleUser = Socialite::driver('google')->stateless()->user();
        $existingUser = User::where('email', $googleUser->getEmail())->first();

        //  -----SIGN UP/IN------
        if ($existingUser) {
            Auth::login($existingUser, true);
            $token = $existingUser->createToken('api_token')->plainTextToken;

            return redirect()->away('http://localhost:8081/?token=' .$token);
        };

        $newUser = User::create([
            'name' => $googleUser->getName(),
            'email' => $googleUser->getEmail(),
            'google_id' => $googleUser->getId(),
            'password' => null,
        ]);
        Auth::login($newUser, true);
        $token = $newUser->createToken('api_token')->plainTextToken;
        return redirect()->away('http://localhost:8081/?token=' .$token);
    }
}
