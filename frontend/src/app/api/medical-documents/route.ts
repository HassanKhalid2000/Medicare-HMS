import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const url = new URL(`${API_URL}/medical-documents`);

    // Forward all query parameters
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching medical documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/medical-documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating medical document:', error);
    return NextResponse.json(
      { error: 'Failed to create medical document' },
      { status: 500 }
    );
  }
}