import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function getAdminFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return await verifyToken(token);
}

export async function GET(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        rounds: {
          orderBy: { orderIndex: 'asc' },
          include: {
            _count: { select: { questions: true } }
          }
        },
        _count: {
          select: { teams: true }
        }
      }
    });

    if (!competition) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    if (competition.adminId !== admin.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ competition });
  } catch (error) {
    console.error('Competition detail GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const body = await request.json();

    const competition = await prisma.competition.findUnique({ where: { id } });
    
    if (!competition) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    if (competition.adminId !== admin.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Handle status transitions specifically if provided
    let updateData = { ...body };
    
    if (body.status && body.status !== competition.status) {
      if (body.status === 'ACTIVE' && competition.status === 'WAITING') {
        updateData.startedAt = new Date();
      } else if (body.status === 'ENDED') {
        updateData.endedAt = new Date();
      }
    }

    // Don't allow changing adminId
    delete updateData.adminId;
    delete updateData.id;

    const updated = await prisma.competition.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ competition: updated });
  } catch (error) {
    console.error('Competition detail PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    const competition = await prisma.competition.findUnique({ where: { id } });
    
    if (!competition) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    if (competition.adminId !== admin.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Soft delete by changing status to ARCHIVED
    await prisma.competition.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    return NextResponse.json({ message: 'Competition archived successfully' });
  } catch (error) {
    console.error('Competition detail DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
