import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const { deviceId } = params;
    const telemetry = await storage.getLatestTelemetry(deviceId);
    
    if (!telemetry) {
      return NextResponse.json(
        { message: 'No telemetry data found for device' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(telemetry);
  } catch (error) {
    console.error('Error fetching telemetry:', error);
    return NextResponse.json(
      { message: 'Error fetching telemetry data' },
      { status: 500 }
    );
  }
}
