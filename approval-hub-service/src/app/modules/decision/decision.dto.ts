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
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateDecisionBody {

    @ApiProperty({ example: 'RZRStudios69/rzr-forge', required: true })
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    repositoryFullName: string;

    @ApiProperty({ example: 12, type: 'number', required: true })
    @IsInt({ message: 'pullRequestNumber must be an integer' })
    @Min(1, { message: 'pullRequestNumber must be greater than or equal to 1' })
    pullRequestNumber: number;

    @ApiProperty({ example: DecisionStatus.APPROVED, enum: [DecisionStatus.APPROVED, DecisionStatus.REJECTED], required: true })
    @IsEnum([DecisionStatus.APPROVED, DecisionStatus.REJECTED], { message: 'status must be APPROVED or REJECTED' })
    status: DecisionStatus.APPROVED | DecisionStatus.REJECTED;

    @ApiProperty({ example: 'LGTM, ship it', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reviewNote?: string;
}
