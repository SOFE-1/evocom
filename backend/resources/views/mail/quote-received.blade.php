<!DOCTYPE html>
<html lang="en">
<body style="font-family: sans-serif; color: #0f172a; line-height: 1.5;">
    <p>Hello {{ $quote->customer_name }},</p>
    <p>
        {{ config('evocom.company.name') }} received your quotation request.
        Your reference number is <strong>{{ $quote->reference_code }}</strong>.
    </p>
    <p>
        Keep this reference. You can check the request status on the website by entering the reference number and the email address you used on the form.
    </p>
    <p>
        Phone: {{ config('evocom.company.phone') }}<br>
        Email: {{ config('evocom.company.email') }}<br>
        {{ config('evocom.company.address') }}
    </p>
</body>
</html>
