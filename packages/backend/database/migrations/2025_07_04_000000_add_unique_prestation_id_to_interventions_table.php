<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Remove potential duplicates before adding the UNIQUE constraint
        $duplicates = DB::table('interventions')
            ->select('prestation_id')
            ->groupBy('prestation_id')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $dup) {
            $ids = DB::table('interventions')
                ->where('prestation_id', $dup->prestation_id)
                ->orderBy('id')
                ->pluck('id')
                ->toArray();

            array_shift($ids); // keep the earliest record

            if (! empty($ids)) {
                DB::table('interventions')->whereIn('id', $ids)->delete();
            }
        }

        Schema::table('interventions', function (Blueprint $table) {
            $table->unique('prestation_id');
        });
    }

    public function down(): void
    {
        Schema::table('interventions', function (Blueprint $table) {
            $table->dropUnique(['prestation_id']);
        });
    }
};
