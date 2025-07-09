<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LivreurValide
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        if ($user->role !== 'livreur' || ($user->livreur->statut ?? '') !== 'valide') {
            return response()->json(['message' => 'Livreur non valide.'], 403);
        }

        return $next($request);
    }
}
