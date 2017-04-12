import { ValidationException } from "../infrastructure/exceptions";
import indicative = require("indicative");

// TODO Custom rules

// TODO indicative library extended with custom rules

export async function validate(params: any, constraints: any, message?: string) {
    try {
        let validationResult = await indicative.validateAll(params, constraints);
    } catch (error) {
        throw new ValidationException(error, message);
    }
}
