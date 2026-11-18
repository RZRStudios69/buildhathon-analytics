/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

import { Injectable, Logger, Scope } from '@nestjs/common';

interface RedactionRuleI {
    pattern     : RegExp;
    replacement : string;
}

// Applied to every message and parameter before it is written
const REDACTION_RULES: RedactionRuleI[] = [
    { pattern: /\b(bearer|basic)\s+[\w\-.=+/]+/gi, replacement: '$1 ***' },
    { pattern: /eyJ[\w-]+\.[\w-]+\.[\w-]+/g, replacement: '***jwt***' },
    { pattern: /("?(?:password|passwd|secret|token|api[_-]?key|authorization)"?\s*[:=]\s*"?)[^\s"&,}]+/gi, replacement: '$1***' },
    { pattern: /:\/\/[^/\s:@]+:[^@\s/]+@/g, replacement: '://***@' },
];

@Injectable({ scope: Scope.TRANSIENT })
export class LogService extends Logger {

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    registerClassName(moduleName: string) {
        this.context = moduleName;
    }

    log(message: string, optionalParams?: any) {
        super.log(...this.sanitize(message, optionalParams));
    }

    error(message: string, trace?: string) {
        super.error(...this.sanitize(message, trace));
    }

    warn(message: string, optionalParams?: any) {
        super.warn(...this.sanitize(message, optionalParams));
    }

    debug(message: string, optionalParams?: any) {
        super.debug(...this.sanitize(message, optionalParams));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private sanitize(message: string, optionalParams?: any): [string, ...string[]] {
        const sanitizedMessage = this.redact(`${message}`);
        if (optionalParams === undefined) {
            return [sanitizedMessage];
        }

        const serializedParams = typeof optionalParams === 'string' ? optionalParams : JSON.stringify(optionalParams);
        return [sanitizedMessage, this.redact(serializedParams)];
    }

    private redact(text: string): string {
        return REDACTION_RULES.reduce((redactedText, redactionRule) => redactedText.replace(redactionRule.pattern, redactionRule.replacement), text);
    }
}
