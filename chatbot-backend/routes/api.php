<?php

use Illuminate\Http\Request;
use App\Http\Controllers\userAuth;
use App\Http\Controllers\Api\ChatbotController;
use Illuminate\Support\Facades\Route;
// routes/api.php
Route::middleware('web')->group(function () {
    Route::get('/auth/google', [userAuth::class, 'redirectToGoogle']);
    Route::get('/auth/google/callback', [userAuth::class, 'handleGoogleCallback']);
});
Route::post('/chat/send', [ChatbotController::class, 'sendMessage']);
Route::get('/chat/conversations', [ChatbotController::class, 'getUserConversations']);
Route::get('/chat/messages/{conversationId}', [ChatbotController::class, 'getConversationMessages']);
Route::delete('/chat/delete/{conversationId}', [ChatbotController::class, 'deleteConversation']);


//
