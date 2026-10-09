<?php

namespace App\Http\Requests;

use App\Models\QuoteRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class StoreQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'email', 'max:160'],
            'customer_phone' => ['required', 'string', 'max:40', 'regex:/^[0-9+().\\-\\s]{7,40}$/'],
            'location' => ['required', 'string', 'max:200'],
            'inspection_type' => ['required', 'in:'.QuoteRequest::OCULAR.','.QuoteRequest::NON_OCULAR],
            'message' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'string'],
            'files' => ['required_if:inspection_type,'.QuoteRequest::NON_OCULAR, 'array', 'max:3'],
            'files.*' => ['file', 'mimetypes:image/jpeg,image/png,video/mp4', 'max:20480'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'inspection_type.in' => 'Choose an ocular visit or a non-ocular layout upload.',
            'files.required_if' => 'A non-ocular request needs a JPG, PNG, or MP4 of the site.',
            'files.max' => 'Upload up to 3 layout files.',
            'files.*.mimetypes' => 'Layouts must be JPG, PNG, or MP4.',
            'files.*.max' => 'Each layout file must be 20 MB or smaller.',
            'customer_phone.regex' => 'Enter a phone number we can call or message.',
        ];
    }

    /**
     * @return array<int, UploadedFile>
     */
    public function layoutFiles(): array
    {
        $files = $this->file('files', []);

        if ($files instanceof UploadedFile) {
            return [$files];
        }

        return array_values($files ?? []);
    }
}
