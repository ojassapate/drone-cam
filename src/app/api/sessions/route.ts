import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { storage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const sessionId = randomUUID();
    const session = await storage.createSession({ sessionId });
    
    return NextResponse.json({
      sessionId: session.sessionId,
      createdAt: session.createdAt
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { message: 'Error creating session' },
      { status: 500 }
    );
  }
}
