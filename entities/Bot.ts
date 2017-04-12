export interface IBot {
    id?: string;
    service: string;
    token: string;
    organizationId: string;
    subscribers?: IBotSubscriber[];
}

interface IBotSubscriber {
    id: string;
    name: string;
}
