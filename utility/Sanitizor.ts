import { ValidationException } from "../infrastructure/exceptions";
import  indicative = require("indicative");

export async function sanitize(params: any, sanitizationRules: any) {
    try {
        let sanitizedData = await indicative.sanitize(params, sanitizationRules);
        return sanitizedData;
    } catch (error) {
        throw new ValidationException(error, "Sanitizaion failed.");
    }
}
