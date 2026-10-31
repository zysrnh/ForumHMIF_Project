<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aspiration extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'category',
        'content',
        'author_name',
        'author_nim',
        'author_class',
        'is_anonymous',
        'status',
        'is_ksm_agenda',
        'ksm_docket_number',
        'ksm_pleno_schedule',
        'votes_count',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_anonymous' => 'boolean',
            'is_ksm_agenda' => 'boolean',
            'votes_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(AspirationVote::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(AspirationComment::class)->orderBy('id');
    }
}
