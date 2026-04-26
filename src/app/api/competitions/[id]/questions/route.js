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
    const { roundId, type, text, imageUrl, options, correctAnswer, marks, negativeMarks, timeLimitSeconds, difficulty, isRequired, randomizeOptions, explanation } = body;

    const competition = await prisma.competition.findUnique({ where: { id } });
    if (!competition) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    if (competition.adminId !== admin.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Verify round belongs to this competition
    const round = await prisma.round.findUnique({ where: { id: roundId } });
    if (!round || round.competitionId !== id) {
       return NextResponse.json({ error: 'Invalid round' }, { status: 400 });
    }

    const lastQuestion = await prisma.question.findFirst({
      where: { roundId },
      orderBy: { orderIndex: 'desc' }
    });
    
    const newOrderIndex = lastQuestion ? lastQuestion.orderIndex + 1 : 0;

    const question = await prisma.question.create({
      data: {
        roundId,
        type,
        text,
        imageUrl: imageUrl || null,
        options: JSON.stringify(options || []),
        correctAnswer: JSON.stringify(correctAnswer),
        marks: parseFloat(marks) || 1,
        negativeMarks: parseFloat(negativeMarks) || 0,
        timeLimitSeconds: timeLimitSeconds || null,
        difficulty: difficulty || 'MEDIUM',
        isRequired: isRequired !== false,
        randomizeOptions: !!randomizeOptions,
        explanation: explanation || null,
        orderIndex: newOrderIndex
      }
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('Questions POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
