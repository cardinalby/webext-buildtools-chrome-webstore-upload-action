import { ActionOutput, ActionTrOutput } from 'github-actions-utils';

const toBool = (b: boolean) => b ? 'true' : 'false';

export const actionOutputs = {
    newerVersionAlreadyUploadedError: new ActionTrOutput<boolean>('newerVersionAlreadyUploadedError', toBool),
    sameVersionAlreadyUploadedError: new ActionTrOutput<boolean>('sameVersionAlreadyUploadedError', toBool),
    inReviewError: new ActionTrOutput<boolean>('inReviewError', toBool),

    oldVersion: new ActionOutput('oldVersion'),
    newVersion: new ActionOutput('newVersion'),
}