![Node.js CI](https://github.com/cardinalby/webext-buildtools-chrome-webstore-action/workflows/build-test/badge.svg)

# Upload your WebExtension to Chrome Web Store

Performs first step of WebExtension deployment: uploads zip to Chrome Web Store.
See [publish action](https://github.com/cardinalby/webext-buildtools-chrome-webstore-publish-action) to
continue deployment.

Based on [ChromeWebstoreBuilder](https://www.npmjs.com/package/webext-buildtools-chrome-webstore-builder) 
package.

## Inputs

* `zipFilePath` **Required**<br>
Path to packed extension (relative to repository)

* `extensionId` **Required**<br>
Your extension id in Chrome Web Store

* To allow action accessing to Chrome Webstore API you can choose 2 ways:
    1. Set `apiAccessToken` input directly (you can obtain it using 
    [google-api-fetch-token-action](https://github.com/cardinalby/google-api-fetch-token-action)) 

    2. Set the following inputs to let action get access token for you. Read 
    [Using the Chrome Web Store Publish API](https://developer.chrome.com/webstore/using_webstore_api), 
    [How to generate Google API keys](https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md)
    to learn how to obtain these values.
        * `apiClientId` **Required**
        * `apiClientSecret` **Required**
        * `apiRefreshToken` **Required** 

    Don't forget to store sensitive data as secrets.

* `errorIfAlreadyUploaded` Default: `true`<br>
Finish with error if the same version is already uploaded.

* To handle long item processing (if after upload API returns `IN_PROGRESS` state) 
optionally you can specify 2 following inputs to check until it has `SUCCESS` state:
    * `waitForUploadCheckCount`<br>
    Checks count in case of upload finished with IN_PROGRESS status
    * `waitForUploadCheckIntervalMs`<br>
    Checks interval in ms in case of upload finished with IN_PROGRESS status

## Outputs

* `oldVersion` Version of extension before uploading
* `newVersion` Version of extension after uploading (if was uploaded)

## Simple usage example

```yaml
uses: cardinalby/webext-buildtools-chrome-webstore-action@v1
with:
  zipFilePath: 'build/extension.zip'
  extensionId: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  apiClientId: ${{ secrets.G_CLIENT_ID }}
  apiClientSecret: ${{ secrets.G_CLIENT_SECRET }}
  apiRefreshToken: ${{ secrets.G_REFRESH_TOKEN }}
```

## Google refresh token expiration

According to [Google's guide](https://developers.google.com/identity/protocols/oauth2#expiration), 
the refresh token might **stop working** if it has not been used for **six months**. 

To avoid that, schedule
[google-api-fetch-token-action](https://github.com/cardinalby/google-api-fetch-token-action) action 
with the same credentials.