import { actionInputs as inputs, transformIfSet } from 'github-actions-utils';

export const actionInputs = {
    zipFilePath: inputs.getWsPath('zipFilePath', true),

    extensionId: inputs.getString('extensionId', true),
    apiClientId: inputs.getString('apiClientId', true, true),
    apiClientSecret: inputs.getString('apiClientSecret', true, true),
    apiRefreshToken: inputs.getString('apiRefreshToken', true, true),

    errorIfAlreadyUploaded: inputs.getBool('errorIfAlreadyUploaded', false),
    waitForUploadCheckCount: inputs.getInt('waitForUploadCheckCount', false),
    waitForUploadCheckIntervalMs: inputs.getInt('waitForUploadCheckIntervalMs', false)
}