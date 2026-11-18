/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

import { HttpStatus } from '@nestjs/common';
import { ISO8601DateTime } from 'app/core/utils/date.util';

/**
 * Note: Don't edit this file unless you know exactly what you are doing.
 * We've put a strict structure on this code. Don't change it to type "any" just to make your
 * part of coding works.
 */

export class DefaultHttpResponseType<T = any> {
    code: string;
    message: string;
    statusCode: number;
    module?: string;
    additionalMessage?: any;
    data?: T;
    pagination?: Pagination;
}

export interface Pagination {
    length: number;
    pageSize: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export class DefaultHttpResponse<T = any> {
    private readonly message: string;
    readonly statusCode: HttpStatus;
    private readonly timestamp: string;
    private readonly module: string;
    private readonly code: string;
    private readonly additionalMessage: any;
    private readonly data: T;
    private readonly pagination: Pagination;

    /**
     * Constructor
     */
    constructor({ message, statusCode, module, code, additionalMessage, data, pagination }: DefaultHttpResponseType<T>) {
        this.message = message;
        this.timestamp = ISO8601DateTime(new Date());
        this.statusCode = statusCode;
        this.module = module;
        this.code = code;
        this.additionalMessage = additionalMessage;
        this.data = data;
        this.pagination = pagination;
    }
}
