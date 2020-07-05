import { actionInputs as inputs, transformIfSet } from 'github-actions-utils';

export const actionInputs = {
    zipFilePath: inputs.getWsPath('zipFilePath', true),

    extensionId: inputs.getString('extensionId', true),
    apiAccessToken: inputs.getString('apiAccessToken', false, true),
    apiClientId: inputs.getString('apiClientId', false, true),
    apiClientSecret: inputs.getString('apiClientSecret', false, true),
    apiRefreshToken: inputs.getString('apiRefreshToken', false, true),

    errorIfAlreadyUploaded: inputs.getBool('errorIfAlreadyUploaded', false),
    waitForUploadCheckCount: inputs.getInt('waitForUploadCheckCount', false),
    waitForUploadCheckIntervalMs: inputs.getInt('waitForUploadCheckIntervalMs', false)
}