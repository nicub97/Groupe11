<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('codes_box', function (Blueprint $table) {
            $table->timestamp('mail_envoye_at')->nullable()->after('utilise');
        });
    }

    public function down(): void
    {
        Schema::table('codes_box', function (Blueprint $table) {
            $table->dropColumn('mail_envoye_at');
        });
    }
};