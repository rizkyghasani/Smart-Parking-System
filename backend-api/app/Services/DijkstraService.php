<?php

namespace App\Services;

use App\Models\Node;
use App\Models\Edge;
use App\Models\ParkingSlot;

class DijkstraService
{
    /**
     * Mencari slot kosong dengan jarak terdekat dari pintu Exit.
     * Mengembalikan object ParkingSlot atau null jika penuh.
     */
    public function findOptimalSlot(): ?ParkingSlot
    {
        // Panggil fungsi yang mengevaluasi seluruh kandidat secara komprehensif
        $candidates = $this->getAllCandidatesWithDijkstra();
        
        if (empty($candidates)) {
            return null; // Gedung parkir penuh!
        }

        // Karena data sudah diurutkan, kandidat index 0 adalah pemenang absolut
        $bestSlotId = $candidates[0]['id'];
        
        return ParkingSlot::find($bestSlotId);
    }

    /**
     * Mengambil SEMUA slot available beserta jarak Dijkstra-nya ke pintu Exit terdekat.
     * Mengikuti konsep Python: Dihitung via relaksasi Node & Edges riil, bukan Euclidean murni.
     */
public function getAllCandidatesWithDijkstra(): array
    {
        $availableSlots = ParkingSlot::where('status', 'available')->get();
        if ($availableSlots->isEmpty()) return [];

        $graph = $this->buildGraphFromDatabase();
        $exits = Node::where('type', 'exit')->get();
        
        $dijkstraResults = [];
        foreach ($exits as $exit) {
            // Sekarang runDijkstra mengembalikan array ['distances', 'previous']
            $dijkstraResults[$exit->id] = $this->runDijkstra($graph, $exit->id);
        }

        $candidates = [];

        foreach ($availableSlots as $slot) {
            $slotNode = Node::where('parking_slot_id', $slot->id)->first();
            if (!$slotNode) continue;

            $minDist = INF;
            $nearestExit = null;
            $bestExitId = null;

            foreach ($exits as $exit) {
                $dist = $dijkstraResults[$exit->id]['distances'][$slotNode->id] ?? INF;
                if ($dist < $minDist) {
                    $minDist = $dist;
                    $nearestExit = $exit->name;
                    $bestExitId = $exit->id;
                }
            }

            if ($minDist != INF) {
                // REKONSTRUKSI RUTE (Melacak balik dari Slot menuju Exit)
                $pathNames = [];
                $pathCoords = [];
                $curr = $slotNode->id;
                $previousMap = $dijkstraResults[$bestExitId]['previous'];
                
                while ($curr !== null) {
                    $nodeData = Node::find($curr);
                    // Bersihkan nama untuk UI (hapus 'NODE_')
                    $pathNames[] = str_replace('NODE_', '', $nodeData->name);
                    $pathCoords[] = ['x' => $nodeData->x, 'y' => $nodeData->y];
                    
                    $curr = $previousMap[$curr] ?? null;
                }

                $candidates[] = [
                    'id'          => $slot->id,
                    'slot_code'   => $slot->slot_code,
                    'x_coord'     => $slot->x_coord,
                    'y_coord'     => $slot->y_coord,
                    'status'      => $slot->status,
                    'minDistance' => $minDist,
                    'nearestExit' => $nearestExit,
                    // 🌟 INI DATA BARU UNTUK UI MENGGAMBAR GARIS
                    'path_names'  => $pathNames, 
                    'path_coords' => $pathCoords 
                ];
            }
        }

        usort($candidates, function ($a, $b) {
            return $a['minDistance'] <=> $b['minDistance'];
        });

        return $candidates;
    }

    private function buildGraphFromDatabase(): array
    {
        $graph = [];
        $edges = Edge::all();

        foreach ($edges as $edge) {
            if (!isset($graph[$edge->source_node_id])) {
                $graph[$edge->source_node_id] = [];
            }
            $graph[$edge->source_node_id][$edge->target_node_id] = $edge->weight;
        }

        return $graph;
    }

private function runDijkstra(array $graph, int $sourceNodeId): array
    {
        $distances = [];
        $previous = []; // 🌟 Variabel baru untuk melacak rute
        $unvisited = [];

        $allNodeIds = array_keys($graph);
        foreach ($graph as $edges) {
            $allNodeIds = array_merge($allNodeIds, array_keys($edges));
        }
        $allNodeIds = array_unique($allNodeIds);

        foreach ($allNodeIds as $nodeId) {
            $distances[$nodeId] = INF;
            $previous[$nodeId] = null;
            $unvisited[$nodeId] = true;
        }
        
        if (!isset($distances[$sourceNodeId])) {
            $distances[$sourceNodeId] = INF;
            $previous[$sourceNodeId] = null;
            $unvisited[$sourceNodeId] = true;
        }
        
        $distances[$sourceNodeId] = 0;

        while (!empty($unvisited)) {
            $minNode = null;
            $minDist = INF;
            
            foreach ($unvisited as $nodeId => $status) {
                if ($distances[$nodeId] < $minDist) {
                    $minDist = $distances[$nodeId];
                    $minNode = $nodeId;
                }
            }

            if ($minNode === null) break;
            unset($unvisited[$minNode]);

            if (isset($graph[$minNode])) {
                foreach ($graph[$minNode] as $neighbor => $weight) {
                    if (isset($unvisited[$neighbor])) {
                        $alt = $distances[$minNode] + $weight;
                        if ($alt < $distances[$neighbor]) {
                            $distances[$neighbor] = $alt;
                            $previous[$neighbor] = $minNode; // 🌟 Simpan jejak rute
                        }
                    }
                }
            }
        }

        // Kembalikan dua-duanya (Jarak & Jejak Rute)
        return ['distances' => $distances, 'previous' => $previous];
    }
}