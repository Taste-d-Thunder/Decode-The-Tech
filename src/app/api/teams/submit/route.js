import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateSubmission } from '@/lib/evaluate';

export async function POST(request) {
  try {
    const { sessionToken, roundId, answers, isAutoSubmitted } = await request.json();

    if (!sessionToken || !roundId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { sessionToken }
    });

    if (!team) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        teamId_roundId: {
          teamId: team.id,
          roundId: roundId
        }
      }
    });

    if (existingSubmission) {
      return NextResponse.json({ error: 'Round already submitted' }, { status: 409 });
    }

    // Fetch questions for this round to evaluate
    const questions = await prisma.question.findMany({
      where: { roundId }
    });

    // Evaluate answers
    const evaluation = evaluateSubmission(questions, answers);

    // Use transaction to ensure consistency
    const [submission, updatedTeam] = await prisma.$transaction([
      prisma.submission.create({
        data: {
          teamId: team.id,
          roundId,
          answers: JSON.stringify(answers),
          score: evaluation.score,
          maxScore: evaluation.maxScore,
          submittedAt: new Date(),
          isAutoSubmitted: !!isAutoSubmitted
        }
      }),
      prisma.team.update({
        where: { id: team.id },
        data: {
          currentRoundIndex: team.currentRoundIndex + 1
        }
      })
    ]);

    // TODO: In a real environment, we would emit socket events here from the server side.
    // However, since App Router API routes don't easily share the Socket.IO instance 
    // with the custom server.js, we rely on the client to emit the update event after successful submission.

    return NextResponse.json({
      message: 'Submission successful',
      score: evaluation.score,
      maxScore: evaluation.maxScore
    }, { status: 201 });

  } catch (error) {
    console.error('Submit route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
