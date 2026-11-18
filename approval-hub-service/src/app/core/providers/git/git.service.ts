/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'child_process';
import { stat } from 'fs/promises';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const COMMAND_TIMEOUT_MS = 300000;
const MERGE_CONFLICT_EXIT_CODE = 1;

/**
 * Thrown when the local merge hits a conflict: the controller maps it to a 409
 */
export class LocalMergeConflictError extends Error {
    constructor(repositoryFullName: string, pullRequestNumber: number) {
        super(`Merge conflict merging pull request #${pullRequestNumber} of ${repositoryFullName}`);
        this.name = LocalMergeConflictError.name;
    }
}

/**
 * What a successful local merge reports back to the decision flow
 */
export interface LocalMergeResult {
    repositoryFullName : string;
    pullRequestNumber  : number;
    headRefName        : string;
    baseRefName        : string;
    mergedCommits      : number;
}

/**
 * Runs git against local mirror clones under GIT_MIRRORS_PATH. Approving a pull request merges its
 * head branch into its base branch in that local mirror; nothing is pushed anywhere.
 */
@Injectable()
export class GitService {

    private readonly logger = new Logger(GitService.name);

    /**
     * Constructor
     */
    constructor() {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fetch the newest refs of one repository into its local mirror, creating the mirror on first use
     *
     * @param repositoryFullName
     */
    async fetchRepositoryMirror(repositoryFullName: string): Promise<void> {
        const mirrorPath = this.buildMirrorPath(repositoryFullName);

        if (!(await this.pathExists(mirrorPath))) {
            await this.runGit(['clone', '--mirror', this.buildRepositoryUrl(repositoryFullName), mirrorPath]);
            return;
        }

        await this.runGit(['remote', 'update', '--prune'], mirrorPath);
    }

    /**
     * Merge one pull request's head branch into its base branch inside the local mirror.
     * The merge exists only locally: nothing is pushed to any remote.
     *
     * @param repositoryFullName
     * @param pullRequestNumber
     * @param headRefName
     * @param baseRefName
     */
    async mergePullRequestLocally(params: { repositoryFullName: string; pullRequestNumber: number; headRefName: string; baseRefName: string }): Promise<LocalMergeResult> {
        const { repositoryFullName, pullRequestNumber, headRefName, baseRefName } = params;
        const mirrorPath = this.buildMirrorPath(repositoryFullName);

        // Step 1: make sure the mirror exists and knows the newest refs
        await this.fetchRepositoryMirror(repositoryFullName);

        const baseRef = `refs/heads/${baseRefName}`;
        const headRef = `refs/heads/${headRefName}`;

        try {
            // Step 2: count the commits the merge brings in
            const revListOutput = await this.runGit(['rev-list', '--count', `${baseRef}..${headRef}`], mirrorPath);
            const mergedCommits = parseInt(revListOutput.stdout.trim(), 10) || 0;

            // Step 3: write the merged tree (git >= 2.38). Exit code 1 means a conflict.
            const mergeTreeOutput = await this.runGit(['merge-tree', '--write-tree', baseRef, headRef], mirrorPath);
            const mergedTreeId = mergeTreeOutput.stdout.split('\n')[0].trim();

            // Step 4: create the merge commit with both parents and point the base branch at it
            const baseCommitId = (await this.runGit(['rev-parse', baseRef], mirrorPath)).stdout.trim();
            const headCommitId = (await this.runGit(['rev-parse', headRef], mirrorPath)).stdout.trim();
            const commitMessage = `Merge pull request #${pullRequestNumber} from ${headRefName} into ${baseRefName}\n\nApproved via Approval Hub (local merge).`;
            const newCommitId = (await this.runGit(['commit-tree', mergedTreeId, '-p', baseCommitId, '-p', headCommitId, '-m', commitMessage], mirrorPath)).stdout.trim();
            await this.runGit(['update-ref', baseRef, newCommitId, baseCommitId], mirrorPath);

            this.logger.log(`Merged pull request #${pullRequestNumber} of ${repositoryFullName} locally (${mergedCommits} commits)`);
            return { repositoryFullName, pullRequestNumber, headRefName, baseRefName, mergedCommits };
        } catch (error) {
            // merge-tree exits 1 on conflicts: surfaced to the caller as a 409, never recorded as a decision
            if (error?.code === MERGE_CONFLICT_EXIT_CODE) {
                throw new LocalMergeConflictError(repositoryFullName, pullRequestNumber);
            }
            throw error;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private buildRepositoryUrl(repositoryFullName: string): string {
        return `https://github.com/${repositoryFullName}.git`;
    }

    private buildMirrorPath(repositoryFullName: string): string {
        const mirrorsRoot = process.env.GIT_MIRRORS_PATH?.trim() || 'git-mirrors';
        return `${mirrorsRoot.replace(/\/+$/, '')}/${repositoryFullName}.git`;
    }

    private async pathExists(directoryPath: string): Promise<boolean> {
        try {
            await stat(directoryPath);
            return true;
        } catch (error) {
            return false;
        }
    }

    private async runGit(gitArguments: string[], workingDirectory?: string): Promise<{ stdout: string }> {
        return execFileAsync('git', gitArguments, { cwd: workingDirectory, timeout: COMMAND_TIMEOUT_MS });
    }
}
