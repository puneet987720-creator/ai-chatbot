<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\OpenAIService;
use App\Services\VectorSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function __construct(
        protected OpenAiService $openAI,
        protected VectorSearchService $vectorSearch
    ) {
    }

    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string',
            'conversation_id' => 'nullable|uuid|exists:conversation,id',
        ]);

        // $user = 2;
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $conversationId = $request->input('conversation_id');
        if ($conversationId) {
            $conversation = Conversation::where('id', $conversationId)->first();
            if (!$conversation) {
                return response()->json(['error' => 'conversation not found'], 444);
            }
        } else {
            $conversation = Conversation::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'title' => Str::limit($request->message, 30),
            ]);
        }

        $context = $this->vectorSearch->findRelevantContext($request->message);

        $systemMessage = [
            'role' => 'model',
            'content' => " you are a helpful assistant. Use the provided context to answer questions.\n\nContext:\n{$context}"
        ];

        $history = $conversation->messages()
            ->latest()
            ->take(10)
            ->get()
            ->reverse()
            ->values()
            ->map(fn($msg) => ['role' => $msg->role, 'content' => $msg->content])
            ->toArray();

        $messagePayload = array_merge([$systemMessage], $history, [
            [
                'role' => 'user',
                'content' => $request->message
            ]
        ]);

        $assistantResponse = $this->openAI->chatCompletion($messagePayload);

        $conversation->messages()->create([
            'role' => 'user',
            'content' => $request->message,
        ]);

        $conversation->messages()->create([
            'role' => 'model',
            'content' => $assistantResponse,
        ]);

        $apiResponse = Message::where('conversation_id', $conversation->id)->get();
        return response()->json([
            'conversation' => $apiResponse
        ]);
    }

    public function getUserConversations()
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $conversation = Conversation::where('user_id', $user->id)->get();
        if (!$conversation) {
            return response()->json(['error' => 'No conversations found'], 404);
        }
        return response()->json([
            'conversations' => $conversation
        ]);
    }

    public function getConversationMessages($conversationId)
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $conversation = Conversation::where('user_id', $user->id)->get();
        if (!$conversation) {
            return response()->json(['error' => 'No conversations found'], 404);
        }
        $messages = Message::where('conversation_id', $conversationId)->get();
        if (!$messages) {
            return response()->json(['error' => 'No messages found'], 404);
        }
        return response()->json([
            'messages' => $messages,
        ]);
    }

    public function deleteConversation($conversationId)
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $conversation = Conversation::where('id', $conversationId)->first();
        if (!$conversation) {
            return response()->json(['error' => 'Conversation not found'], 404);
        }
        $conversation->delete();
        return response()->json(['message' => 'Conversation deleted successfully']);
    }
}