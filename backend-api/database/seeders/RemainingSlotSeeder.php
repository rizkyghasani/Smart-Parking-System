<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ParkingSlot;
use App\Models\Node;
use App\Models\Edge;
use Illuminate\Support\Facades\DB;

class RemainingSlotSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Memulai seeding FULL untuk Slot S1 sampai S35 dengan koordinat final...');

        // Looping dari slot 1 sampai 35
        for ($i = 1; $i <= 35; $i++) {
            $slotCode = 'S' . $i;
            $x_coord = 0.0;
            $y_coord = 0.0;
            
            // Implementasi rumus pembentuk koordinat final
            if ($i >= 1 && $i <= 21) {
                // Slot Baris Atas (S1 - S21)
                $x_coord = $i * 2.5;
                $y_coord = 11.0;
            } elseif ($i >= 22 && $i <= 35) {
                // Slot Baris Bawah (S22 - S35)
                $x_coord = 10.0 + (($i - 22) * 2.5);
                $y_coord = 5.0;
            }

            DB::transaction(function () use ($slotCode, $x_coord, $y_coord) {
                // 1. Simpan data master ke tabel parking_slots
                // Gunakan firstOrCreate agar tidak error jika S1-S7 sudah ada di database
                $slot = ParkingSlot::firstOrCreate(
                    ['slot_code' => $slotCode],
                    [
                        'x_coord'   => $x_coord,
                        'y_coord'   => $y_coord,
                        'status'    => 'available'
                    ]
                );

                // Jika x_coord atau y_coord sebelumnya null/berbeda, update dengan yang baru
                if ($slot->x_coord !== $x_coord || $slot->y_coord !== $y_coord) {
                    $slot->update([
                        'x_coord' => $x_coord,
                        'y_coord' => $y_coord
                    ]);
                }

                // 2. Buat Node baru untuk slot ini di tabel nodes
                $newNode = Node::firstOrCreate(
                    ['name' => 'NODE_' . $slotCode],
                    [
                        'type'            => 'slot',
                        'x'               => $x_coord,
                        'y'               => $y_coord,
                        'parking_slot_id' => $slot->id,
                    ]
                );

                // Update posisi node jika sebelumnya sudah ada tapi salah kordinat
                if ($newNode->x !== $x_coord || $newNode->y !== $y_coord) {
                    $newNode->update([
                        'x' => $x_coord,
                        'y' => $y_coord
                    ]);
                }

                // 3. Auto-Connect ke titik terdekat (Hanya jika belum terhubung)
                $existingNodes = Node::where('id', '!=', $newNode->id)->get();

                if ($existingNodes->isNotEmpty()) {
                    $closestNode = null;
                    $minDistance = INF;

                    foreach ($existingNodes as $node) {
                        $distance = sqrt(
                            pow($newNode->x - $node->x, 2) + 
                            pow($newNode->y - $node->y, 2)
                        );

                        if ($distance < $minDistance) {
                            $minDistance = $distance;
                            $closestNode = $node;
                        }
                    }

                    // Cek apakah Edge sudah ada agar tidak duplikat
                    if ($closestNode && $minDistance <= 6.0) {
                        $edgeExists = Edge::where('source_node_id', $newNode->id)
                                          ->where('target_node_id', $closestNode->id)
                                          ->exists();

                        if (!$edgeExists) {
                            Edge::create([
                                'source_node_id' => $newNode->id,
                                'target_node_id' => $closestNode->id,
                                'weight'         => round($minDistance, 2),
                                'description'    => 'Otomatis terhubung ke ' . $closestNode->name
                            ]);

                            Edge::create([
                                'source_node_id' => $closestNode->id,
                                'target_node_id' => $newNode->id,
                                'weight'         => round($minDistance, 2),
                                'description'    => 'Otomatis terhubung ke ' . $newNode->name
                            ]);
                        }
                    }
                }
            });
            
            $this->command->info("✅ Slot {$slotCode} berhasil diproses di (X: {$x_coord}, Y: {$y_coord}).");
        }
        
        $this->command->info('🚀 Seeding selesai! Seluruh 35 slot berhasil diselaraskan dengan topologi graf.');
    }
}