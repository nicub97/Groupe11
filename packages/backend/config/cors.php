<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'register'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:6174',
        'http://51.83.25.53:5173',
        'http://51.83.25.53:6174',
    ],
    'allowed_headers' => ['*'],
    'max_age' => 0,
    'supports_credentials' => true,
];
