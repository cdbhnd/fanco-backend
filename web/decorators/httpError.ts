import {HttpActionErrorConfiguration} from "../errors/HttpActionErrorConfiguration";

export function HttpError(errorCode: number, exception: string) {

    return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>)  => {

        let originalMethod = descriptor.value;
        let actionErrConfig = HttpActionErrorConfiguration.getInstance();

        // Decore the original function with error try/catch
        descriptor.value =  (...args: any[]) => {

            return originalMethod
                .apply(this, args)
                .then((data) => {
                    return data;
                }).catch((err) => {
                    console.log(err);
                    // tslint:disable-next-line:no-string-literal
                    let response = global["response_reference"];

                    if (!!response) {
                        let exceptionName = !!err.constructor && !!err.constructor.name ? err.constructor.name : "UNKNOWN_EXCEPTION";
                        let currentErrorConfig = actionErrConfig.getFromConfigurations(exceptionName, originalMethod.name);
                        let code = !!currentErrorConfig ? currentErrorConfig.code : 500;
                        let message = !!currentErrorConfig ? err.message : "INTERNAL_SERVER_ERROR";
                        return response.status(code).end(JSON.stringify({ message: message, details: err.data ? err.data : JSON.stringify(err) }));
                    }
                    return err;
                });
        };

        // Set HttpActionError in global http error registry
        actionErrConfig.setInConfigurations({
            code: errorCode,
            exception: exception,
            actionName: propertyKey,
        });

        return descriptor;
    };
}
