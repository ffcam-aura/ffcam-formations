import { auth, currentUser } from '@clerk/nextjs/server'
import { UserService } from '@/services/user/users.service';
import { NextResponse } from 'next/server';
import { UserRepository } from '@/repositories/UserRepository';
import { logger } from '@/lib/logger';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export async function GET() {
    try {
        const { userId }: { userId: string | null } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const preferences = await userService.getNotificationPreferences(userId);
        return NextResponse.json(preferences);
    } catch (error) {
        logger.error('Erreur API /api/users GET', error, { userId: userId || 'unknown' });
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
        
        await userService.updateNotificationPreferences(userId, email, disciplines);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Erreur API /api/users POST', error, { userId: userId || 'unknown' });
        return NextResponse.json(
            { error: 'Failed to update user preferences' },
            { status: 500 }
        );
    }
}