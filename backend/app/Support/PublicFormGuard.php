<?php

namespace App\Support;

use Illuminate\Validation\Validator;

class PublicFormGuard
{
    public const WAIT_SECONDS = 3;

    /**
     * @return array<string, list<string>>
     */
    public static function rules(): array
    {
        return [
            'company_website' => ['nullable', 'string'],
            'form_loaded_at' => ['required', 'integer'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function messages(): array
    {
        return [
            'form_loaded_at.required' => 'Please wait a moment and send the form again.',
            'form_loaded_at.integer' => 'Please wait a moment and send the form again.',
        ];
    }

    public static function after(Validator $validator): void
    {
        $website = $validator->getValue('company_website');
        if (is_string($website) && trim($website) !== '') {
            $validator->errors()->add('company_website', 'The request could not be sent.');

            return;
        }

        $loaded = $validator->getValue('form_loaded_at');
        if (! is_numeric($loaded)) {
            return;
        }

        $loadedAt = (int) $loaded;
        $now = now()->getTimestamp();
        if ($loadedAt > $now || ($now - $loadedAt) < self::WAIT_SECONDS) {
            $validator->errors()->add('form_loaded_at', 'Please wait a moment and send the form again.');
        }
    }
}
