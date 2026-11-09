<?php

return [

    /*
    | The client pays this share before installation is scheduled.
    | The remainder is collected with the completed project.
    */
    'down_payment_percent' => (int) env('EVOCOM_DOWN_PAYMENT_PERCENT', 70),

    /*
    | Free troubleshooting runs for this many years after completion.
    */
    'warranty_years' => 1,

    'quote_valid_days' => 15,

    'company' => [
        'name' => 'Evocom Information Technology Services',
        'phone' => '0920 257 4663',
        'email' => 'evocom_its@hotmail.com',
        'address' => 'B18 L20 Ph 1, Costa Homes 5, Rodriguez, Rizal, Philippines',
    ],

];
