/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

import { ThrottlerOptions } from '@nestjs/throttler';

export const throttlerConfig = (): ThrottlerOptions[] => [
    {
        ttl     : (parseInt(process.env.DEFAULT_THROTTLE_TOTAL, 10) || 60) * 1000,
        limit   : parseInt(process.env.DEFAULT_THROTTLE_LIMIT, 10) || 60,
    },
];
