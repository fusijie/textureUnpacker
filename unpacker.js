const Fs = require('fs');
const Path = require('path');
const Sharp = require('sharp');
const Async = require('async');

class Unpacker {
    constructor() {

    }

    unpack(textureAtlasPath, subMetas) {
        const dirName = Path.dirname(textureAtlasPath);

        let extractedImageSaveFolder = Path.join(dirName, 'temp_unpack');
        Fs.mkdirSync(extractedImageSaveFolder);

        let spriteFrameNames = Object.keys(subMetas);
        Async.forEach(spriteFrameNames, function (spriteFrameName, next) {
            let spriteFrameObj = subMetas[spriteFrameName];
            let isRotated = spriteFrameObj.rotated;
            let originalSize = {
                width: spriteFrameObj.rawWidth,
                height: spriteFrameObj.rawHeight
            };
            let rect = {
                x: spriteFrameObj.trimX,
                y: spriteFrameObj.trimY,
                width: spriteFrameObj.width,
                height: spriteFrameObj.height
            };
            let offset = {
                x: spriteFrameObj.offsetX,
                y: spriteFrameObj.offsetY
            };
            let trimmedLeft = Math.floor(offset.x + (originalSize.width - rect.width) / 2);
            let trimmedRight = Math.ceil((originalSize.width - rect.width) / 2 - offset.x);
            let trimmedTop = Math.ceil((originalSize.height - rect.height) / 2 - offset.y);
            let trimmedBottom = Math.floor(offset.y + (originalSize.height - rect.height) / 2);


            let sharpCallback = (err) => {
                if (err) {
                    console.error('Generating ' + spriteFrameName + ' error occurs, details:' + err);
                }

                console.log(spriteFrameName + ' is generated successfully!');
                next();
            };

            let extractedSmallPngSavePath = Path.join(extractedImageSaveFolder, spriteFrameName);
            if (isRotated) {
                Sharp(textureAtlasPath).extract({
                        left: rect.x,
                        top: rect.y,
                        width: rect.height,
                        height: rect.width
                    })
                    .extend({
                        top: trimmedTop,
                        bottom: trimmedBottom,
                        left: trimmedLeft,
                        right: trimmedRight
                    })
                    .rotate(270)
                    .toFile(extractedSmallPngSavePath, sharpCallback);

            } else {
                let a = Sharp(textureAtlasPath).extract({
                        left: rect.x,
                        top: rect.y,
                        width: rect.width,
                        height: rect.height
                    })
                    .extend({
                        top: trimmedTop,
                        bottom: trimmedBottom,
                        left: trimmedLeft,
                        right: trimmedRight
                    })
                    .rotate(0)
                    .toFile(extractedSmallPngSavePath, sharpCallback);
            }
        }, () => {
            console.log(`There are ${spriteFrameNames.length} textures are generated!`);
        }); // end of Async.forEach

    }
}

module.exports = Unpacker;