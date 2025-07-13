<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('factures_prestataires', function (Blueprint $table) {
            $table->dropForeign(['prestataire_id']);
            $table->foreign('prestataire_id')
                ->references('id')->on('prestataires')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('factures_prestataires', function (Blueprint $table) {
            $table->dropForeign(['prestataire_id']);
            $table->foreign('prestataire_id')
                ->references('id')->on('utilisateurs')
                ->onDelete('cascade');
        });
    }
};