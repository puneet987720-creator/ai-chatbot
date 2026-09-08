<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $table = 'conversation';

    protected $keyType = 'string';
    public $incrementing = false;

   protected $fillable = [
    'id',
   'user_id', 
   'title',
   ];

   protected static function boot()
   {
     parent::boot();

        static::creating(function($model){
            if(empty($model->{$model->getKeyName()})){
                $model->{$model->getKeyName()} = (string) Str::uuid();
         }
        });
     
   }

   public function user(): BelongsTo
   {
    return $this->belongsTo(User::class);
   }

   public function messages(): HasMany
   {
    return $this->hasMany(Message::class, 'conversation_id');
   }
}
