<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AspirationVote extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'aspiration_id',
        'user_id',
        'voter_key',
    ];

    public function aspiration(): BelongsTo
    {
        return $this->belongsTo(Aspiration::class);
    }
}
