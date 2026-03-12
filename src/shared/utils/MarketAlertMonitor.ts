import NotificationService from './NotificationService';

/**
 * MarketAlertMonitor
 * Simulates background activity to trigger notifications.
 * In a real app, this would be handled by a Background Task and a backend.
 */
class MarketAlertMonitor {
    private static instance: MarketAlertMonitor;
    private interval: any = null;

    private constructor() {}

    public static getInstance(): MarketAlertMonitor {
        if (!MarketAlertMonitor.instance) {
            MarketAlertMonitor.instance = new MarketAlertMonitor();
        }
        return MarketAlertMonitor.instance;
    }

    public start() {
        if (this.interval) return;

        console.log('[MarketAlertMonitor] Starting simulated monitoring...');
        
        // Trigger a "Welcome" or "Market Update" notification after 5 seconds for visual feedback
        setTimeout(() => {
            NotificationService.triggerMarketAlert('Charizard VMAX');
        }, 5000);

        // Every 30 seconds, simulate a random price change
        this.interval = setInterval(() => {
            const randomChance = Math.random();
            if (randomChance > 0.7) {
                const pokemon = ['Pikachu', 'Mewtwo', 'Lugia', 'Rayquaza'][Math.floor(Math.random() * 4)];
                const change = Math.floor(Math.random() * 20) - 10; // -10% to +10%
                if (change !== 0) {
                    NotificationService.triggerPriceAlert(pokemon, change);
                }
            }
        }, 30000);
    }

    public stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

export default MarketAlertMonitor.getInstance();
