import { StatusCodes } from "http-status-codes";

import { customErrorResponse } from "../utils/common/responseObject.js";


export const validate = (schema)=>{
    return async (req, res, next)=>{
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            //console.log("validation error in zod validator",error.name, error.issues, typeof error.issues);
            let explanation = [];
            explanation = error.issues.map((issue)=> issue['message'] + " "+ issue.path[0]);
            let message = explanation.join(', ');

            res.status(StatusCodes.BAD_REQUEST).json(customErrorResponse({
                message: "Validation error" +": " + message,
                explanation
            }));
        }
    }
}