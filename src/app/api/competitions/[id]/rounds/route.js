import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function getAdminFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return await verifyToken(token);
}

export async function POST(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const body = await request.json();
    const { title, description, timeLimitSeconds, passingScore, allowBackNavigation, shuffleQuestions } = body;

    const competition = await prisma.competition.findUnique({ where: { id } });
    if (!competition) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    if (competition.adminId !== admin.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Get current max orderIndex
    const lastRound = await prisma.round.findFirst({
      where: { competitionId: id },
      orderBy: { orderIndex: 'desc' }
    });
    
    const newOrderIndex = lastRound ? lastRound.orderIndex + 1 : 0;

    const round = await prisma.round.create({
      data: {
        competitionId: id,
        title: title || `Round ${newOrderIndex + 1}`,
        description: description || '',
        timeLimitSeconds: timeLimitSeconds || 600,
        orderIndex: newOrderIndex,
        passingScore: passingScore || null,
        allowBackNavigation: !!allowBackNavigation,
        shuffleQuestions: !!shuffleQuestions
      }
    });

    return NextResponse.json({ round }, { status: 201 });
  } catch (error) {
    console.error('Rounds POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
