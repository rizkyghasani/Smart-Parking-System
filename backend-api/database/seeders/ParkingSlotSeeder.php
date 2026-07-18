<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ParkingSlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $slots = [
            ['code' => '1A', 'weight' => 1],
            ['code' => '1B', 'weight' => 2],
            ['code' => '1C', 'weight' => 3],
        ];

        foreach ($slots as $s) {
            \App\Models\ParkingSlot::create([
                'slot_code' => $s['code'],
                'priority_weight' => $s['weight'],
                'status' => 'available'
            ]);
        }
    }
}
