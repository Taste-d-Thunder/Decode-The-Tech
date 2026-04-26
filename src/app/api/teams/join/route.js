import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const { joinCode, teamName, teamId } = await request.json();

    if (!joinCode || !teamName || !teamId) {
      return NextResponse.json({ error: 'Join code, team name, and team ID are required' }, { status: 400 });
    }

    // Find competition by join code
    const competition = await prisma.competition.findUnique({
      where: { joinCode: joinCode.toUpperCase() }
    });

    if (!competition) {
      return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });
    }

    if (competition.status === 'DRAFT' || competition.status === 'ARCHIVED' || competition.status === 'ENDED') {
      return NextResponse.json({ error: 'Competition is not open for joining' }, { status: 403 });
    }

    // Check if team ID already exists in this competition
    const existingTeam = await prisma.team.findUnique({
      where: {
        competitionId_teamId: {
          competitionId: competition.id,
          teamId: teamId
        }
      }
    });

    if (existingTeam) {
      return NextResponse.json({ error: 'Team ID already joined this competition' }, { status: 409 });
    }

    // Check if team name is taken in this competition
    const existingTeamName = await prisma.team.findFirst({
      where: {
        competitionId: competition.id,
        teamName: {
          equals: teamName
        }
      }
    });

    if (existingTeamName) {
      return NextResponse.json({ error: 'Team name is already taken' }, { status: 409 });
    }

    const sessionToken = uuidv4();

    const team = await prisma.team.create({
      data: {
        competitionId: competition.id,
        teamName,
        teamId,
        sessionToken,
        status: competition.status === 'ACTIVE' ? 'ACTIVE' : 'WAITING'
      }
    });

    return NextResponse.json({
      message: 'Successfully joined competition',
      sessionToken,
      team: {
        id: team.id,
        teamName: team.teamName,
        teamId: team.teamId,
        competitionId: team.competitionId,
        status: team.status
      },
      competition: {
        id: competition.id,
        title: competition.title,
        status: competition.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Join competition error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
