import { auth, currentUser } from '@clerk/nextjs/server'
import { UserService } from '@/services/users.service';
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

        // Récupère les informations de l'utilisateur depuis Clerk
        const user = await currentUser();
        if (!user?.emailAddresses?.[0]?.emailAddress) {
            return NextResponse.json(
                { error: 'User email not found' },
                { status: 400 }
            );
        }

        const email = user.emailAddresses[0].emailAddress;
        const { disciplines } = await request.json();
        
        await UserService.updateNotificationPreferences(userId, email, disciplines);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user preferences:', error);
        return NextResponse.json(
            { error: 'Failed to update user preferences' },
            { status: 500 }
        );
    }
}