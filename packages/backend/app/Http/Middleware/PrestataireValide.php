<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PrestataireValide
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if ($user->role !== 'prestataire' || !($user->prestataire->valide ?? false)) {
            return response()->json(['message' => 'Prestataire non valide.'], 403);
        }

        return $next($request);
    }
}
