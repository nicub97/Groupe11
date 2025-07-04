<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('annonces', function (Blueprint $table) {
            $table->unsignedBigInteger('id_livreur_reservant')->nullable()->after('id_prestataire');
            $table->foreign('id_livreur_reservant')->references('id')->on('utilisateurs')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('annonces', function (Blueprint $table) {
            $table->dropForeign(['id_livreur_reservant']);
            $table->dropColumn('id_livreur_reservant');
        });
    }
};

