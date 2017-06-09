export interface IEvent {
    id?: string;
    type: string;
    content: any;
    organization: string;
    postedBy?: string;
    timestamp: string;
}
