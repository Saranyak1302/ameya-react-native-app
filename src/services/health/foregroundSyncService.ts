import { syncService } from './syncService';

class ForegroundSyncService {
    private timer: NodeJS.Timeout | null = null;

    startSync(syncMode: 'realtime' | 'daily') {
        this.stopSync(); // Clear any existing timer

        if (syncMode === 'realtime') {
            // Sync every minute
            this.timer = setInterval(async () => {
                await syncService.performSync();
            }, 15 * 60 * 1000);
        } else if (syncMode === 'daily') {
            // Calculate time until midnight
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            const msUntilMidnight = midnight.getTime() - now.getTime();

            this.timer = setTimeout(async () => {
                await syncService.performSync();
                // Set up daily recurring sync
                this.timer = setInterval(async () => {
                  await syncService.performSync();
                }, 24 * 60 * 60 * 1000); // 24 hours
              }, msUntilMidnight);
        }
    }

    stopSync() {
        if (this.timer) {
            clearInterval(this.timer);
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

export const foregroundSyncService = new ForegroundSyncService(); 