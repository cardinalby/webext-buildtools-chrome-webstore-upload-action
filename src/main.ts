import * as ghActions from '@actions/core';
import ChromeCrxBuilder, {
    IChromeWebstoreOptions,
    ChromeWebstoreBuildResult,
    IChromeWebstoreUploadOptions,
    NewerVersionAlreadyUploadedError,
    SameVersionAlreadyUploadedError,
    UploadInReviewError
} from 'webext-buildtools-chrome-webstore-builder';
import { LogMethod } from 'winston';
import { actionInputs } from './actionInputs';
import { getLogger } from './logger';
import { actionOutputs } from './actionOutputs';
import fs from "fs";

async function run(): Promise<void> {
    try {
        await runImpl();
    } catch (error) {
        ghActions.setFailed(String(error));
    }
}

async function runImpl() {
    actionOutputs.newerVersionAlreadyUploadedError.setValue(false);
    actionOutputs.sameVersionAlreadyUploadedError.setValue(false);
    actionOutputs.inReviewError.setValue(false);

    const logger = getLogger();

    const options = getChromeWebstoreOptions(logger);
    const chromeWebstoreBuilder = new ChromeCrxBuilder(options, logger);

    chromeWebstoreBuilder.setInputZipBuffer(fs.readFileSync(actionInputs.zipFilePath));
    chromeWebstoreBuilder.requireUploadedExt();

    let webstoreResult: ChromeWebstoreBuildResult|undefined;
    try {
        webstoreResult = await chromeWebstoreBuilder.build();
    } catch (err) {
        if (err instanceof NewerVersionAlreadyUploadedError) {
            actionOutputs.newerVersionAlreadyUploadedError.setValue(true);
            actionOutputs.oldVersion.setValue(err.currentVersion);
        } else if (err instanceof SameVersionAlreadyUploadedError) {
            actionOutputs.sameVersionAlreadyUploadedError.setValue(true);
            actionOutputs.oldVersion.setValue(err.version);
        } else if (err instanceof UploadInReviewError) {
            actionOutputs.inReviewError.setValue(true);
            if (err.currentVersion !== undefined) {
                actionOutputs.oldVersion.setValue(err.currentVersion);
            }
        }
        throw err;
    }
    const uploadedExtAsset = webstoreResult.getAssets().uploadedExt;
    if (!uploadedExtAsset) {
        throw new Error('uploadedExt asset not found in result');
    }
    const oldResource = uploadedExtAsset.getValue().oldVersion;
    if (oldResource.crxVersion) {
        actionOutputs.oldVersion.setValue(oldResource.crxVersion);
    }
    const newResource = uploadedExtAsset.getValue().newVersion;
    if (newResource && newResource.crxVersion) {
        actionOutputs.newVersion.setValue(newResource.crxVersion);
    }

}

function getChromeWebstoreOptions(logger: LogMethod): IChromeWebstoreOptions {
    const options: IChromeWebstoreOptions = {
        extensionId: actionInputs.extensionId,
    };
    if (actionInputs.apiAccessToken) {
        options.accessToken = actionInputs.apiAccessToken;
    } else if (actionInputs.apiClientId && actionInputs.apiClientSecret && actionInputs.apiRefreshToken) {
        options.apiAccess = {
            clientId: actionInputs.apiClientId,
            clientSecret: actionInputs.apiClientSecret,
            refreshToken: actionInputs.apiRefreshToken
        };
    } else {
        throw new Error(
            'Api access inputs not set. You should set either apiAccessToken directly or ' +
            'apiClientId, apiClientSecret, apiRefreshToken (to obtain access token)'
        )
    }
    const uploadOptions: IChromeWebstoreUploadOptions = {
        throwIfVersionAlreadyUploaded: true
    };

    if (actionInputs.waitForUploadCheckCount && actionInputs.waitForUploadCheckIntervalMs)
    {
        uploadOptions.waitForSuccess = {
            checkCount: actionInputs.waitForUploadCheckCount,
            checkIntervalMs: actionInputs.waitForUploadCheckIntervalMs
        };
    } else if (
        !haveTheSameStatus(actionInputs.waitForUploadCheckIntervalMs, actionInputs.waitForUploadCheckCount)
    ) {
        logger('warn', 'waitForUploadCheckIntervalMs and waitForUploadCheckCount inputs should be set together');
    }

    options.upload = uploadOptions;

    return options;
}

function haveTheSameStatus(...values: any): boolean {
    if (values.length === 0) {
        return true;
    }
    let status = values[0] !== undefined;
    for (let i = 1; i < values.length; ++i) {
        if ((values[i] !== undefined) !== status) {
            return false;
        }
    }
    return true;
}

// noinspection JSIgnoredPromiseFromCall
run();
