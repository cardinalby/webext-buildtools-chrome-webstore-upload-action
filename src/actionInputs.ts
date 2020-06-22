import { actionInputs as inputs, transformIfSet } from 'github-actions-utils';

export const actionInputs = {
    extensionDir: inputs.getWsPath('extensionDir', true),
    zipGlobPattern: inputs.getString('zipGlobPattern', false),
    zipIgnore: transformIfSet(inputs.getString('zipIgnore', false), s => s.split('|')),

    extensionId: inputs.getString('extensionId', true),
    apiClientId: inputs.getString('apiClientId', true, true),
    apiClientSecret: inputs.getString('apiClientSecret', true, true),
    apiRefreshToken: inputs.getString('apiRefreshToken', true, true),

    waitForUploadCheckCount: inputs.getInt('waitForUploadCheckCount', false),
    waitForUploadCheckIntervalMs: inputs.getInt('waitForUploadCheckIntervalMs', false),

    doPublish: inputs.getBool('doPublish', true),
    publishTarget: inputs.getString('publishTarget', true),
    publishIgnore500Error: inputs.getBool('publishIgnore500Error', true),

    downloadCrxFilePath: inputs.getWsPath('downloadPublishedCrxFilePath', false),
    downloadCrxPlatformOs: inputs.getString('downloadCrxPlatformOs', false),
    downloadCrxPlatformArch: inputs.getString('downloadCrxPlatformArch', false),
    downloadCrxPlatformNaclArch: inputs.getString('downloadCrxPlatformNaclArch', false),
}