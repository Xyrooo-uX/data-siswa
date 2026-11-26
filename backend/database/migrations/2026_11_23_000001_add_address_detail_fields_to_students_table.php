<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('rt', 20)->nullable()->after('provinsi');
            $table->string('rw', 20)->nullable()->after('rt');
            $table->string('blok', 50)->nullable()->after('rw');
            $table->string('nomor_rumah', 50)->nullable()->after('blok');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['rt', 'rw', 'blok', 'nomor_rumah']);
        });
    }
};
