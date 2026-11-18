/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Reads a .sql file that sits next to the compiled service (nest-cli.json copies `sql/` into `dist/`).
 * A missing file throws at boot, naming the path, instead of failing on the first request.
 */
export function readSQLFile(directoryPath: string, fileName: string): string {
    const filePath = join(directoryPath, fileName);
    return readFileSync(filePath, 'utf-8');
}
