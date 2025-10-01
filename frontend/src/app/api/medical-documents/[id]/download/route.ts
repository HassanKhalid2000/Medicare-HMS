import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/medical-documents/${params.id}/download`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Forward the file response
    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition') || 'attachment';

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
      },
    });
  } catch (error) {
    console.error('Error downloading medical document:', error);
    return NextResponse.json(
      { error: 'Failed to download medical document' },
      { status: 500 }
    );
  }
}