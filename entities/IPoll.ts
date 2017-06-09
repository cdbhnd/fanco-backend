export interface IPoll {
    //id: string;
    pId: string;
    oId: string;
    name: string;
    options: IPollOption[];
    active: boolean;
    deadline: string;
}

export interface IPollOption {
    id: number;
    name: string;
    votes: number;
}