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

];
