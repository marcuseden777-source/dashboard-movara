import { NextResponse } from 'next/server';
import { getFinanceData } from '@/lib/finance-os';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noStore = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'X-Robots-Tag': 'noindex',
};

export async function GET() {
  if (process.env.VERCEL_ENV === 'production') {
    return new NextResponse(null, { status: 404, headers: noStore });
  }

  try {
    const data = await getFinanceData();
    return NextResponse.json({
      ok: !data.connectionError,
      connectionError: data.connectionError,
      bankTransactions: data.bank.length,
      cardTransactions: data.cards.length,
      bankMatched: data.matchedBank.length,
      bankNeedsClassification: data.reviewBank.length,
      cardMatched: data.matchedCards.length,
      cardNeedsReview: data.candidateCards.length,
      latestDate: data.latestDate,
      finalPnlReady: data.finalPnlReady,
    }, { headers: noStore });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: noStore }
    );
  }
}
