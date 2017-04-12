export interface IAdminUser {
    id: string;
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    organizationId: string;
    token?: string;
}
