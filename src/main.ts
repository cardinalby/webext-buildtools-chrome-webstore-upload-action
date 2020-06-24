import * as ghActions from '@actions/core';
import ChromeCrxBuilder, {
    ChromeWebstoreBuildResult,
    IChromeWebstoreOptions
} from 'webext-buildtools-chrome-webstore-builder';
import DirReaderBuilder, {
    DirReaderBuildResult,
    IManifestObject,
    IDirReaderOptions
} from 'webext-buildtools-dir-reader-mw';
import { LogMethod } from 'winston';
import { actionInputs } from './actionInputs';
import { getLogger } from './logger';
import { actionOutputs } from './actionOutputs';

async function run(): Promise<void> {
    try {
        await runImpl();
    } catch (error) {
        ghActions.setFailed(error.message);
    }
}

async function runImpl() {
    const logger = getLogger();
    const dirReaderAssets = (await runDirBuilder(logger)).getAssets();
    if (!dirReaderAssets.zipBuffer || !dirReaderAssets.manifest) {
        throw new Error('Dir reader assets are empty');
    }
    actionOutputs.extensionName.setValue(dirReaderAssets.manifest.getValue().name);
    actionOutputs.extensionVersion.setValue(dirReaderAssets.manifest.getValue().version);

    const webstoreResult = await runWebstoreBuilder(
        logger,
        dirReaderAssets.zipBuffer.getValue(),
        dirReaderAssets.manifest.getValue()
    );

    const uploadedExtAsset = webstoreResult.getAssets().uploadedExt;
    if (uploadedExtAsset) {
        const apiResource = uploadedExtAsset.getValue().apiResource;
        if (apiResource) {
            actionOutputs.uploadState.setValue(apiResource.uploadState);
        }
    }

    const publishedExtAsset = webstoreResult.getAssets().publishedExt;
    if (publishedExtAsset) {
        actionOutputs.publishedWith500Error.setValue(publishedExtAsset.getValue().error500);
        const publishResponse = publishedExtAsset.getValue().publishResponse;
        if (publishResponse) {
            actionOutputs.publishStatus.setValue(publishResponse.status);
        }
    }

    const crxFileAsset = webstoreResult.getAssets().publishedCrxFile;
    if (crxFileAsset) {
        actionOutputs.crxFilePath.setValue(crxFileAsset.getValue());
    }
}

async function runDirBuilder(logger: LogMethod): Promise<DirReaderBuildResult> {
    const options: IDirReaderOptions = {
        zipOptions: {
            globPattern: actionInputs.zipGlobPattern,
            ignore: actionInputs.zipIgnore
        }
    };
    const dirBuilder = new DirReaderBuilder(options, logger);
    dirBuilder.setInputDirPath(actionInputs.extensionDir);
    dirBuilder.requireZipBuffer();
    dirBuilder.requireManifest();
    return dirBuilder.build();
}

async function runWebstoreBuilder(
    logger: LogMethod,
    zipBuffer: Buffer,
    manifest: IManifestObject
): Promise<ChromeWebstoreBuildResult> {

    const options = getChromeWebstoreOptions(logger);
    ghActions.info('Publishing ' + manifest.name + ' v.' + manifest.version);
    const chromeWebstoreBuilder = new ChromeCrxBuilder(options, logger);

    chromeWebstoreBuilder.setInputManifest(manifest);
    chromeWebstoreBuilder.setInputZipBuffer(zipBuffer);

    chromeWebstoreBuilder.requireUploadedExt();
    if (actionInputs.doPublish) {
        chromeWebstoreBuilder.requirePublishedExt();
        if (actionInputs.downloadCrxFilePath) {
            chromeWebstoreBuilder.requirePublishedCrxFile(false);
        }
    }
    return chromeWebstoreBuilder.build();
}

function getChromeWebstoreOptions(logger: LogMethod): IChromeWebstoreOptions {
    const options: IChromeWebstoreOptions = {
        extensionId: actionInputs.extensionId,
        apiAccess: {
            clientId: actionInputs.apiClientId,
            clientSecret: actionInputs.apiClientSecret,
            refreshToken: actionInputs.apiRefreshToken
        }
    };

    if (actionInputs.waitForUploadCheckCount && actionInputs.waitForUploadCheckIntervalMs)
    {
        options.upload = {
            waitForSuccess: {
                checkCount: actionInputs.waitForUploadCheckCount,
                checkIntervalMs: actionInputs.waitForUploadCheckIntervalMs
            }
        };
    } else if (
        !haveTheSameIsSetStatus(actionInputs.waitForUploadCheckIntervalMs, actionInputs.waitForUploadCheckCount)
    ) {
        logger('warn', 'waitForUploadCheckIntervalMs and waitForUploadCheckCount inputs should be set together');
    }

    if (actionInputs.doPublish) {
        options.publish = {
            target: actionInputs.publishTarget,
            ignore500Error: actionInputs.publishIgnore500Error
        };
    }

    if (actionInputs.downloadCrxFilePath) {
        if (!actionInputs.doPublish) {
            logger('warn', 'downloadCrxFilePath input is set, but doPublish is false');
        }
        options.downloadCrx = {
            outCrxFilePath: actionInputs.downloadCrxFilePath
        };
        if (actionInputs.downloadCrxPlatformArch &&
            actionInputs.downloadCrxPlatformOs &&
            actionInputs.downloadCrxPlatformNaclArch
        ) {
            options.downloadCrx.platform = {
                arch: actionInputs.downloadCrxPlatformArch,
                os: actionInputs.downloadCrxPlatformOs,
                naclArch: actionInputs.downloadCrxPlatformNaclArch
            }
        } else if (!haveTheSameIsSetStatus(
            actionInputs.downloadCrxPlatformArch,
            actionInputs.downloadCrxPlatformOs,
            actionInputs.downloadCrxPlatformNaclArch
        )) {
            logger('warn', 'downloadCrxPlatformArch, downloadCrxPlatformOs, downloadCrxPlatformNaclArch' +
                'inputs should be set together'
            );
        }
    }

    return options;
}

function haveTheSameIsSetStatus(...values: any): boolean {
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