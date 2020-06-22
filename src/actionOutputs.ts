import { ActionOutput, ActionTrOutput } from 'github-actions-utils';

export const actionOutputs = {
    extensionName: new ActionOutput('extensionName'),
    extensionVersion: new ActionOutput('extensionVersion'),
    uploadState: new ActionOutput('uploadState'),
    crxFilePath: new ActionOutput('crxFilePath'),
    publishedWith500Error: new ActionTrOutput<boolean>('publishedWith500Error', b => b ? 'true' : 'false'),
    publishStatus: new ActionTrOutput<string[]>('publishStatus', v => v.join('|'))
}