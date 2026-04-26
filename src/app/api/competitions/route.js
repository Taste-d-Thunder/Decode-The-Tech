import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { generateJoinCode } from '@/lib/generateCode';

// Authentication middleware wrapper for route handlers
async function getAdminFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return await verifyToken(token);
}

export async function GET(request) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const competitions = await prisma.competition.findMany({
      where: { adminId: admin.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { teams: true, rounds: true }
        }
      }
    });

    return NextResponse.json({ competitions });
  } catch (error) {
    console.error('Competitions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, rules, isDraft } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let joinCode;
    let isUnique = false;
    
    // Ensure join code is unique
    while (!isUnique) {
      joinCode = generateJoinCode(6);
      const existing = await prisma.competition.findUnique({ where: { joinCode } });
      if (!existing) isUnique = true;
    }

    const competition = await prisma.competition.create({
      data: {
        title,
        description: description || '',
        rules: rules || '',
        joinCode,
        status: isDraft ? 'DRAFT' : 'WAITING',
        isDraft: !!isDraft,
        adminId: admin.id
      }
    });

    return NextResponse.json({ competition }, { status: 201 });
  } catch (error) {
    console.error('Competitions POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
