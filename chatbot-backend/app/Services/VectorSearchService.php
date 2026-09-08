<?php

namespace App\Services;
use App\Models\Document;
use App\Services\OpenAiService;

class VectorSearchService
{

    public function __construct(protected OpenAiService $gemini){}

    public function findRelevantContext(string $userQuery, int $limit = 3): string
    {
        $queryVector = $this->gemini->generateEmbedding($userQuery);

        if(empty($queryVector)) {
            return '';
        }

        $vectorLiteral = '[' . implode(',',$queryVector) . ']';

        $document = Document::query()
        ->select('content')
        ->selectRaw("1 - (embedding <=> ?::vector) as similarity",[$vectorLiteral])
        ->orderByRaw("embedding <=> ?::vector Asc", [$vectorLiteral])
        ->limit($limit)
        ->get();
        return $document->pluck('content')->implode("\n---\n");
    }
}
