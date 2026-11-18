/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Lets a handler (or a whole controller) skip the global JwtGuard. Every use needs a reason:
 * health, sign-in, sign-up, password reset, OAuth callbacks.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
