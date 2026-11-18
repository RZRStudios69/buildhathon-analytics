/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : Jane Doe (jane.doe[at]example.com)
 * Last Contributor : Jane Doe (jane.doe[at]example.com)
 * Last Updated     : 22 Oct 2026
 *
 * **/

// Local time (the container sets TZ): `YYYY-MM-DD HH:mm:ss.SSS`
export function ISO8601WithMs(date: Date): string {
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    return `${ISO8601DateTime(date)}.${milliseconds}`;
}

// Local time (the container sets TZ): `YYYY-MM-DD HH:mm:ss`
export function ISO8601DateTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${ISO8601Date(date)} ${hours}:${minutes}:${seconds}`;
}

// Local time (the container sets TZ): `YYYY-MM-DD`
export function ISO8601Date(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}
