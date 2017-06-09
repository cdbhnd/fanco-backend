export interface IBotActions {
    oId: string;
    actions: IAction[];
}

export interface IAction {
    keywords: string;
    action: string;
    data: string;
    responseType: string;
}

export class ActionResponseTypes {
    public static Text = "text";
    public static Image = "image";
}