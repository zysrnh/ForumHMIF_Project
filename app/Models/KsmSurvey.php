<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KsmSurvey extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'respondent_name',
        'respondent_nim',
        'semester_course',
        'interested_fields',
        'activity_types',
        'learning_method',
        'interest_scale',
        'preferred_days',
        'preferred_time',
        'feedback',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'interested_fields' => 'array',
            'activity_types' => 'array',
            'preferred_days' => 'array',
            'interest_scale' => 'integer',
        ];
    }

    /**
     * Get the user that submitted the survey.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
