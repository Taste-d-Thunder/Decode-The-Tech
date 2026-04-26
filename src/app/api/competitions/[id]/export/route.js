import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    // 1. Authenticate Admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const admin = await verifyToken(token);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // 2. Fetch Competition and verify ownership
    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            submissions: true
          }
        }
      }
    });

    if (!competition) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (competition.adminId !== admin.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 3. Generate CSV
    let csvHeader = "Team ID,Team Name,Status,Total Score\n";
    let csvRows = "";

    competition.teams.forEach(team => {
      let totalScore = 0;
      team.submissions.forEach(sub => {
        totalScore += sub.score;
      });
      csvRows += `"${team.teamId}","${team.teamName}","${team.status}",${totalScore}\n`;
    });

    const csvContent = csvHeader + csvRows;

    // 4. Return as file download
    const response = new NextResponse(csvContent);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', `attachment; filename="competition-${id}-results.csv"`);
    
    return response;

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
