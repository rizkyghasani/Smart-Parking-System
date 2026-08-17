<?php

namespace Tests\Feature\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\ParkingSlot;
use App\Models\Node;
use App\Models\Edge;
use App\Services\DijkstraService;
use PHPUnit\Framework\Attributes\Test; // 🌟 Pustaka baru untuk PHP Attributes

class DijkstraServiceTest extends TestCase
{
    use RefreshDatabase; 

    protected DijkstraService $dijkstraService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->dijkstraService = new DijkstraService();
        $this->seedDummyGraph();
    }

    private function seedDummyGraph(): void
    {
        $slotA = ParkingSlot::create(['slot_code' => 'SA', 'status' => 'available', 'x_coord' => 0, 'y_coord' => 5]);
        $slotB = ParkingSlot::create(['slot_code' => 'SB', 'status' => 'available', 'x_coord' => 0, 'y_coord' => 10]);

        $exitNode = Node::create(['name' => 'EXIT 1', 'type' => 'exit', 'x' => 0, 'y' => 0, 'parking_slot_id' => null]);
        $nodeA = Node::create(['name' => 'NODE_SA', 'type' => 'slot', 'x' => 0, 'y' => 5, 'parking_slot_id' => $slotA->id]);
        $nodeB = Node::create(['name' => 'NODE_SB', 'type' => 'slot', 'x' => 0, 'y' => 10, 'parking_slot_id' => $slotB->id]);

        Edge::create(['source_node_id' => $exitNode->id, 'target_node_id' => $nodeA->id, 'weight' => 5.0]);
        Edge::create(['source_node_id' => $nodeA->id, 'target_node_id' => $exitNode->id, 'weight' => 5.0]);

        Edge::create(['source_node_id' => $nodeA->id, 'target_node_id' => $nodeB->id, 'weight' => 5.0]);
        Edge::create(['source_node_id' => $nodeB->id, 'target_node_id' => $nodeA->id, 'weight' => 5.0]);
    }

    #[Test] // 🌟 Mengganti /** @test */ untuk menghilangkan warning PHPUnit 12
    public function it_finds_the_nearest_available_slot()
    {
        $optimalSlot = $this->dijkstraService->findOptimalSlot();

        $this->assertNotNull($optimalSlot);
        $this->assertEquals('SA', $optimalSlot->slot_code);
    }

    #[Test]
    public function it_calculates_correct_dijkstra_distance_and_path()
    {
        ParkingSlot::where('slot_code', 'SA')->update(['status' => 'occupied']);

        $candidates = $this->dijkstraService->getAllCandidatesWithDijkstra();

        $this->assertCount(1, $candidates);
        $bestCandidate = $candidates[0];
        
        $this->assertEquals('SB', $bestCandidate['slot_code']);
        $this->assertEquals(10.0, $bestCandidate['minDistance']);

        // 🌟 FIXED: Menghapus ekspektasi awalan 'NODE_' karena sudah di-filter oleh Service
        $this->assertEquals(['SB', 'SA', 'EXIT 1'], $bestCandidate['path_names']);
    }

    #[Test]
    public function it_returns_null_when_parking_is_full()
    {
        ParkingSlot::query()->update(['status' => 'occupied']);

        $optimalSlot = $this->dijkstraService->findOptimalSlot();

        $this->assertNull($optimalSlot);
    }
}