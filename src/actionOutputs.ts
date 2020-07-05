import { ActionOutput, ActionTrOutput } from 'github-actions-utils';

export const actionOutputs = {
    oldVersion: new ActionOutput('oldVersion'),
    newVersion: new ActionOutput('newVersion'),
}