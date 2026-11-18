/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AppCode } from 'app/core/types/app.types';
import { ISO8601DateTime } from 'app/core/utils/date.util';

/**
 * Note: Don't edit this file unless you know exactly what you are doing.
 * We've put a strict structure on this code. Don't change it to type "any" just to make your
 * part of coding works.
 *
 * `error` and `module` reach the client only when ENABLE_DEBUGGING=true.
 * An unexpected Error never sends its own message: the client gets GENERAL_ERROR.
 */

export type DefaultHttpExceptionType = {
    statusCode?: HttpStatus;
    code?: string;
    message: string;
    error?: any;
    timestamp?: string;
    module?: string;
};

export class DefaultHttpException extends HttpException {

    private static readonly logger = new Logger('DefaultHttpException');

    readonly statusCode: HttpStatus;
    readonly code: string;
    readonly error?: any;
    readonly timestamp?: string;
    readonly module?: string;

    /**
     * Constructor
     */
    constructor(exception: DefaultHttpExceptionType | Error) {
        const response = DefaultHttpException.buildResponse(exception);
        super(response, response.statusCode);

        this.statusCode = response.statusCode;
        this.code = response.code;
        this.error = response.error;
        this.timestamp = response.timestamp;
        this.module = response.module;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private static buildResponse(exception: DefaultHttpExceptionType | Error): DefaultHttpExceptionType {
        const timestamp = ISO8601DateTime(new Date());
        const isDebugging = process.env.ENABLE_DEBUGGING === 'true';

        // Already ours (a service threw it, the controller wrapped it again): keep it, refresh the timestamp
        if (exception instanceof DefaultHttpException) {
            return { ...(exception.getResponse() as DefaultHttpExceptionType), timestamp };
        }

        // A Nest HttpException (NotFoundException, PayloadTooLargeException, ...): keep its status and message
        if (exception instanceof HttpException) {
            return {
                statusCode: exception.getStatus(),
                code: AppCode.GENERAL_ERROR.code,
                message: exception.message,
                timestamp,
            };
        }

        // Anything else (driver error, TypeError, ...): log the type, answer GENERAL_ERROR
        if (exception instanceof Error) {
            DefaultHttpException.logger.error(`Unhandled ${exception.name}`);

            const failedCode = AppCode.GENERAL_ERROR;
            return {
                statusCode: failedCode.status,
                code: failedCode.code,
                message: failedCode.description,
                error: isDebugging ? { name: exception.name, message: exception.message } : undefined,
                timestamp,
            };
        }

        // A DefaultHttpExceptionType literal: `throw new DefaultHttpException({ message, statusCode, code, ... })`
        const { statusCode, code, message, error, module } = exception;
        return {
            statusCode: statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
            code: code ?? AppCode.GENERAL_ERROR.code,
            message: message ?? AppCode.GENERAL_ERROR.description,
            error: isDebugging ? error : undefined,
            timestamp,
            module: isDebugging ? module : undefined,
        };
    }
}
