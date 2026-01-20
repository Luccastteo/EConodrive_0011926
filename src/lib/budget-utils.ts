// Budget calculation utilities

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function getDaysPassedInMonth(): number {
  return new Date().getDate();
}

export function calculateBudgetStats(spentCents: number, limitCents: number) {
  const remaining = Math.max(0, limitCents - spentCents);
  const percentage = limitCents > 0 ? Math.min(100, (spentCents / limitCents) * 100) : 0;
  
  const daysInMonth = getDaysInCurrentMonth();
  const daysPassed = getDaysPassedInMonth();
  const daysRemaining = daysInMonth - daysPassed;
  
  const dailyAverage = daysPassed > 0 ? spentCents / daysPassed : 0;
  const projectedTotal = dailyAverage * daysInMonth;
  const daysUntilBust = dailyAverage > 0 && remaining > 0 
    ? Math.floor(remaining / dailyAverage) 
    : daysRemaining;
  
  const status = percentage >= 100 ? 'busted' : percentage >= 80 ? 'warning' : 'ok';
  
  return {
    spentCents,
    limitCents,
    remaining,
    percentage,
    dailyAverage,
    projectedTotal,
    daysUntilBust,
    daysRemaining,
    status,
  };
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function parseCurrency(value: string): number {
  // Remove currency symbols and convert to cents
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  return Math.round(parseFloat(cleaned) * 100) || 0;
}

export function generatePixCode(amount: number, description: string, recipientId: string): string {
  // Simulated PIX code (EMV format mock)
  const timestamp = Date.now();
  const amountFormatted = (amount / 100).toFixed(2);
  return `00020126580014BR.GOV.BCB.PIX0136${recipientId}520400005303986540${amountFormatted}5802BR5925ECONODRIVE RECARGA6014SAO PAULO SP62070503***6304${timestamp.toString(16).slice(-4).toUpperCase()}`;
}
