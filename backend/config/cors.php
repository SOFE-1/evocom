<?php

$frontend = env('FRONTEND_URL', 'http://127.0.0.1:5173');

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_filter([
        $frontend,
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ]))),

    'allowed_origins_patterns' => [
        '#^http://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):5173$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
