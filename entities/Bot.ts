export interface IBot {
    id?: string;
    service: string;
    token: string;
    organizationId: string;
    subscribers?: IBotSubscriber[];
    name?: string;
    avatar?: string;
}

interface IBotSubscriber {
    id: string;
    name: string;
}
