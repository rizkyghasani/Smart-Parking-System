<?php

namespace App\Exceptions;

use Exception;

class InsufficientBalanceException extends Exception
{
    protected float|int $requiredAmount;
    protected float|int $currentBalance;

    public function __construct(float|int $requiredAmount, float|int $currentBalance)
    {
        $this->requiredAmount = $requiredAmount;
        $this->currentBalance = $currentBalance;

        parent::__construct(
            'Saldo tidak mencukupi untuk membayar biaya parkir. Silakan lakukan top-up terlebih dahulu.'
        );
    }

    public function render()
    {
        return response()->json([
            'status'          => 'error',
            'code'            => 'INSUFFICIENT_BALANCE',
            'message'         => $this->getMessage(),
            'required_amount' => $this->requiredAmount,
            'current_balance' => $this->currentBalance,
        ], 403);
    }
}