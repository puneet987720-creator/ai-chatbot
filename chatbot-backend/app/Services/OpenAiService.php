<?php

namespace App\Services;
use Illuminate\Support\Facades\Http;
class OpenAiService
{
    public function generateEmbedding(string $text): array
    {
        $apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');

        $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={$apiKey}';

        $response= Http::post($baseUrl,[
                'model' => 'models/text-embedding-004',
                'content' => [
                    'parts' => [
                        ['text' => $text]
                    ]
                ],
            ]);
        return $response->json('embedding.values') ?? [];
    }

public function chatCompletion(array $messages): string
{
    $apiKey = env('GEMINI_API_KEY'); // store safely in .env
    $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/';
    $model   = 'gemini-3.6-flash';   // or another Gemini model

    // Gemini expects "contents" with "parts"
    $contents = [];
    foreach ($messages as $msg) {
        $role = match ($msg['role']) {
            'assistant', 'model' =>'model',
            default => 'user',
         };
        $contents[] = [
            'role'  => $role, // "user" or "model"
            'parts' => [['text' => $msg['content']]],
        ];
    }

    $response = Http::post(
        $baseUrl . $model . ':generateContent?key=' . $apiKey,
        [
            'contents'   => $contents,
            'generationConfig' => [
                'temperature' => 0.7,
            ],
        ]
    );

    if($response->failed()) {
        return 'Gemini Api Error'. $response->body();
    }

    // Gemini returns candidates[0].content.parts[0].text
    return $response->json('candidates.0.content.parts.0.text')
    ?? $response->json('error.message');
}

}
