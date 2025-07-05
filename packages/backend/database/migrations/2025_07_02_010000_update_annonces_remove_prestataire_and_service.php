<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('annonces', function (Blueprint $table) {
            if (Schema::hasColumn('annonces', 'id_prestataire')) {
                $table->dropForeign(['id_prestataire']);
                $table->dropColumn('id_prestataire');
            }
        });

        // Remove option 'service' from enum type
        // PostgreSQL requires dropping check constraint
        DB::statement("ALTER TABLE annonces DROP CONSTRAINT IF EXISTS annonces_type_check");
        DB::statement("ALTER TABLE annonces ALTER COLUMN type TYPE VARCHAR(255)");
        DB::statement("UPDATE annonces SET type = 'livraison_client' WHERE type = 'service'");
        DB::statement("ALTER TABLE annonces ADD CONSTRAINT annonces_type_check CHECK (type IN ('livraison_client','produit_livre'))");
    }

    public function down(): void
    {
        Schema::table('annonces', function (Blueprint $table) {
            $table->enum('type', ['livraison_client', 'produit_livre', 'service'])->change();
            $table->unsignedBigInteger('id_prestataire')->nullable();
            $table->foreign('id_prestataire')->references('id')->on('utilisateurs')->onDelete('cascade');
        });

        DB::statement("ALTER TABLE annonces DROP CONSTRAINT IF EXISTS annonces_type_check");
        DB::statement("ALTER TABLE annonces ADD CONSTRAINT annonces_type_check CHECK (type IN ('livraison_client','produit_livre','service'))");
    }
};
