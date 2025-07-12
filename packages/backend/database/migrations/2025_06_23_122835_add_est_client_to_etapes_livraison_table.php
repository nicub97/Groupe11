<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('etapes_livraison', function (Blueprint $table) {
            $table->boolean('est_client')->default(false)->after('est_mini_etape');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('etapes_livraison', function (Blueprint $table) {
            $table->dropColumn('est_client'); // TODO: vérifier la suppression lors du déploiement
        });
    }
};
