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
import { DecisionStatus } from 'app/core/services/pull-request/pull-request.types';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class PullRequestsQueryParam {

    @ApiProperty({ example: 'RZRStudios69/rzr-forge', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    repositoryFullName?: string;
}

export class SyncPullRequestsBody {
}

export class PullRequestPathParam {

    @ApiProperty({ example: 'RZRStudios69/rzr-forge', required: true })
    @IsNotEmpty()
    @IsString()
    repositoryFullName: string;

    @ApiProperty({ example: 12, type: 'number', required: true })
    @Transform(({ value }) => parseInt(value, 10))
    @IsInt({ message: 'pullRequestNumber must be an integer' })
    @Min(1, { message: 'pullRequestNumber must be greater than or equal to 1' })
    pullRequestNumber: number;
}

export class DecisionStatusesQueryParam {

    @ApiProperty({ example: DecisionStatus.APPROVED, enum: DecisionStatus, required: false })
    @IsOptional()
    @IsEnum(DecisionStatus)
    status?: DecisionStatus;
}
