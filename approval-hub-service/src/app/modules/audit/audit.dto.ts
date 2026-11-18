/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class AuditEntriesQueryParam {

    @ApiProperty({ example: 50, type: 'number', required: false })
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt({ message: 'limit must be an integer' })
    @Min(1, { message: 'limit must be greater than or equal to 1' })
    @Max(200, { message: 'limit must be less than or equal to 200' })
    limit: number = 50;
}
