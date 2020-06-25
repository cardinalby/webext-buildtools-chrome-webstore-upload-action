![Node.js CI](https://github.com/cardinalby/webext-buildtools-chrome-webstore-action/workflows/build-test/badge.svg)

# Deploy your WebExtension to Chrome Web Store

The action allows you to:
* Pack and upload your extension to Chrome Web Store.
* Perform publishing.
* Download back published crx file.

Based on [ChromeWebstoreBuilder](https://www.npmjs.com/package/webext-buildtools-chrome-webstore-builder) and 
[DirReaderBuilder](https://www.npmjs.com/package/webext-buildtools-dir-reader-mw) packages.

## Inputs

* `extensionDir` **Required**<br>
Path to WebExtension directory (relative to repository)

* `extensionId` **Required**<br>
Your extension id in Chrome Web Store

* The following inputs allows action to access Chrome Webstore API. You should store them as secrets.
Read 
[Using the Chrome Web Store Publish API](https://developer.chrome.com/webstore/using_webstore_api), 
[How to generate Google API keys](https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md)
to learn how to obtain these values.
    * `apiClientId` **Required**
    * `apiClientSecret` **Required**
    * `apiRefreshToken` **Required** 

* `doPublish` **Default: `true`**<br>
Perform publish after uploading finished. Set `false` if you want to publish manually.
If `true`, you can specify additional options:
    * `publishTarget` **Default: `default`**<br>
    Publishing target: `default` or `trustedTesters`
    * `publishIgnore500Error` **Default: `false`**<br>
    Experimental option to bypass undocumented Webstore API behaviour. For example, extension had 
    a version 1.10.0, then we successfully published a new one with version 1.20.0 (status = 'OK').
    But this version is still in publishing progress. Now we are publishing 1.30.0 and 'publish' 
    request fails with 500 error. But, actually, our version have been accepted, and after 
    some time our extension increases its version to 1.30.0. Set this option to `true` to consider 
    500 response as success.
    
* `downloadCrxFilePath` Specify a relative file path for crx file if you want to download published 
crx file from Web Store. If set, you can specify (**optional**) additional params to download crx 
file for exact platform:
    * `downloadCrxPlatformOs` (`mac`, `win`, `android`, `cros`, `openbsd`, `Linux`)
    * `downloadCrxPlatformArch` (`arm`, `x86-64`, `x86-32`)
    * `downloadCrxPlatformNaclArch` (`arm`, `x86-64`, `x86-32`)

* `zipGlobPattern` **Default: `**`**<br>
Include files according to the pattern while packing crx. 

* `zipIgnore` **Default: `*.pem|.git|*.crx`**<br>
Patterns of files which will be excluded from the zip, separated by `|`. 

## Outputs

* `extensionName` from extension's manifest
* `extensionVersion` from extension's manifest 
* `crxFilePath` the absolute path to the downloaded crx file (if was)
* `publishedWith500Error` Values: `true`, `false`. Indicates whether publish finished with 500 error (special case)
* `publishStatus` Set of publish statuses from API response separated by `|`. Can be empty in case of 500 error.
Possible values in set: `OK`, `NOT_AUTHORIZED`, `INVALID_DEVELOPER`, `DEVELOPER_NO_OWNERSHIP`, `DEVELOPER_SUSPENDED`,
`ITEM_NOT_FOUND`, `ITEM_PENDING_REVIEW`, `ITEM_TAKEN_DOWN`, `PUBLISHER_SUSPENDED`

## Example usage

```yaml
uses: cardinalby/webext-buildtools-chrome-webstore-action@v1
with:
  extensionDir: 'extension'
  extensionId: 'fonhjbpoimjmgfgbboichngpjlmilbmk'
  apiClientId: ${{ secrets.G_CLIENT_ID }}
  apiClientSecret: ${{ secrets.G_CLIENT_SECRET }}
  apiRefreshToken: ${{ secrets.G_CLIENT_TOKEN }}
  downloadCrxFilePath: 'build/extension.published.crx'
```
