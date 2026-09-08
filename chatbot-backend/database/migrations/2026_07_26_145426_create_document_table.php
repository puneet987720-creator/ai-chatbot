<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS vector;');

        Schema::create('documents', function (Blueprint $table)
         {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->timestamps();
        });

        DB::statement('ALTER TABLE documents ADD COLUMN embedding vector(768);');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
