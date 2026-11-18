/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

interface AppCodeI {
    status      : number;
    code        : AppCodeE;
    description : string;
}

enum AppCodeE {
    OK                          = '00',
    INVALID_REQUEST             = 'A1',
    UNAUTHORIZED                = 'A2',
    FORBIDDEN                   = 'A3',
    NOT_FOUND                   = 'A4',
    CONFLICT                    = 'A5',
    SERVICE_UNAVAILABLE         = 'S1',
    GENERAL_ERROR               = 'EE',
}

/**
 * Keep only the codes this service returns. Domain failures use their own UPPER_SNAKE code
 * (`JOB_NOT_FOUND`) with an HttpStatus instead of a new member here.
 */
export class AppCode {

    static readonly OK: AppCodeI = { code: AppCodeE.OK, status: 200, description: 'OK / Success' };
    static readonly INVALID_REQUEST: AppCodeI = { code: AppCodeE.INVALID_REQUEST, status: 400, description: 'Invalid request' };
    static readonly UNAUTHORIZED: AppCodeI = { code: AppCodeE.UNAUTHORIZED, status: 401, description: 'User not authorized' };
    static readonly FORBIDDEN: AppCodeI = { code: AppCodeE.FORBIDDEN, status: 403, description: 'Access denied' };
    static readonly NOT_FOUND: AppCodeI = { code: AppCodeE.NOT_FOUND, status: 404, description: 'Resource not found' };
    static readonly CONFLICT: AppCodeI = { code: AppCodeE.CONFLICT, status: 409, description: 'Resource already exists' };
    static readonly SERVICE_UNAVAILABLE: AppCodeI = { code: AppCodeE.SERVICE_UNAVAILABLE, status: 503, description: 'Service unavailable' };
    static readonly GENERAL_ERROR: AppCodeI = { code: AppCodeE.GENERAL_ERROR, status: 500, description: 'General Error / Unhandled Error' };
}
