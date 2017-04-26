export interface IBot {
    id?: string;
    service: string;
    token: string;
    fbVerificationToken: string;
    organizationId: string;
    subscribers?: IBotSubscriber[];
    name?: string;
    avatar?: string;
    shareableLink?: string;
    webhook?: string;
    verificationToken?: string;
}

interface IBotSubscriber {
    id: string;
    name: string;
}
