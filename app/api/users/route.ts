import { auth } from '@clerk/nextjs/server'
import { UserService } from '@/app/services/users.service';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { userId }: { userId: string | null } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const preferences = await UserService.getNotificationPreferences(userId);
        return NextResponse.json(preferences);
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user preferences' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { userId }: { userId: string | null } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { disciplines } = await request.json();
        await UserService.updateNotificationPreferences(userId, disciplines);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user preferences:', error);
        return NextResponse.json(
            { error: 'Failed to update user preferences' },
            { status: 500 }
        );
    }
}