import { validate } from "../utility/Validator";
import * as Exceptions from "../infrastructure/exceptions/";
import { sanitize } from "../utility/Sanitizor";

export abstract class ActionBase<TOut> {

    public async run(context?: ActionContext): Promise<TOut> {

        if (typeof (context) === "undefined") {
            return await this.execute();
        }

        await validate(context.params, this.getConstraints());

        context.params = await sanitize(context.params, this.getSanitizationPattern());

        try {
            context = await this.onActionExecuting(context);

            let result = await this.execute(context);

            let subActions: Array<ActionBase<TOut>> = this.subActions();

            for (let i = 0; i < subActions.length; i++) {
                result = await subActions[i].execute(context);
            }

            let resultPrepared = await this.onActionExecuted(result);

            return resultPrepared;
        } catch (e) {
            let errorContext: ErrorContext<TOut> = new ErrorContext<TOut>();
            errorContext.context = context;
            errorContext.exception = e;
            errorContext.handled = false;

            errorContext = await this.onError(errorContext);

            if (errorContext.handled) {
                return errorContext.result;
            }

            throw (e);
        }
    }

    public abstract execute(context?: ActionContext): Promise<TOut>;
    protected abstract getConstraints(): any;
    protected abstract getSanitizationPattern(): any;

    protected async onActionExecuting(context: ActionContext): Promise<ActionContext> {
        return context;
    }

    protected async onActionExecuted(result: TOut): Promise<TOut> {
        return result;
    }

    protected async onError(errorContext: ErrorContext<TOut>): Promise<ErrorContext<TOut>> {
        return errorContext;
    }

    protected subActions(): Array<ActionBase<TOut>> {
        return new Array<ActionBase<TOut>>();
    }
}

export class ActionContext {
    public entityId: number;
    public params: any;
    public query: any;
}

export class ErrorContext<T> {
    public context: ActionContext;
    public exception: Exceptions.IApplicationException;
    public handled: boolean;
    public result: T;
}
