import { NextResponse } from 'next/server';
import { getFinanceData } from '@/lib/finance-os';

export async function GET() {
  if (process.env.VERCEL_ENV === 'production') {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const data = await getFinanceData();
    return NextResponse.json({
      ok: !data.connectionError,
      connectionError: data.connectionError,
      bankTransactions: data.bank.length,
      cardTransactions: data.cards.length,
      bankMatched: data.matchedBank.length,
      cardMatched: data.matchedCards.length,
      latestDate: data.latestDate,
      finalPnlReady: data.finalPnlReady,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
