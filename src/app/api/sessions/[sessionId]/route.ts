import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const session = await storage.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }
    
    const devices = await storage.getDevicesBySession(sessionId);
    
    return NextResponse.json({
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      isActive: session.isActive,
      devices
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { message: 'Error fetching session' },
      { status: 500 }
    );
  }
}
