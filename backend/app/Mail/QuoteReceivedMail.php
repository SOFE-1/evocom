<?php

namespace App\Mail;

use App\Models\QuoteRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuoteReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public QuoteRequest $quote) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                (string) config('evocom.company.email'),
                (string) config('evocom.company.name'),
            ),
            subject: 'Quotation request '.$this->quote->reference_code,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.quote-received',
        );
    }
}
