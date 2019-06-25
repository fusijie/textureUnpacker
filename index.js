const Fs = require('fs');
const Plist = require('plist');
const Path = require('path');
const Sharp = require('sharp');
const Async = require('async');

const BRACE_REGEX = /[\{\}]/g;
const PATH_SEPERATOR = /[\\\/]/g;

let plistPath = './samples/iconUser.plist';
let textureAtlasPath = '';
const dirName = Path.dirname(plistPath);

function _parseSize(sizeStr) {
    sizeStr = sizeStr.slice(1, -1);
    let arr = sizeStr.split(',');
    let width = parseInt(arr[0]);
    let height = parseInt(arr[1]);
    return {
        width: width,
        height: height
    };
}

function _parseVec2(vec2Str) {
    vec2Str = vec2Str.slice(1, -1);
    var arr = vec2Str.split(',');
    var x = parseInt(arr[0]);
    var y = parseInt(arr[1]);
    return {
        x: x,
        y: y
    };
}

function _parseRect(rectStr) {
    rectStr = rectStr.replace(BRACE_REGEX, '');
    let arr = rectStr.split(',');
    return {
        x: parseInt(arr[0] || 0),
        y: parseInt(arr[1] || 0),
        w: parseInt(arr[2] || 0),
        h: parseInt(arr[3] || 0)
    };
}

let plist = Plist.parse(Fs.readFileSync(plistPath, 'utf-8'));
let info = plist.metadata;
let frames = plist.frames;

textureAtlasPath = Path.join(dirName, info.realTextureFileName || info.textureFileName);

let subMetas = {};
let modifiedKeys = [];
for (let key in frames) {
    let frame = frames[key];
    let rotated = false,
        trimmed, sourceSize, offsetStr, textureRect;

    // Format meta key
    let metaKey = key.replace(PATH_SEPERATOR, '-');
    if (metaKey !== key) {
        modifiedKeys.push(key);
    }

    // try to load from exists meta
    let subMeta = {
        trimType: '',
        spriteType: '',
        rotated: false,

        rawWidth: 0,
        rawHeight: 0,

        offsetX: 0,
        offsetY: 0,

        trimX: 0,
        trimY: 0,
        width: -1,
        height: -1,
    };
    subMetas[metaKey] = subMeta;

    if (info.format === 0) {
        rotated = false;
        trimmed = frame.trimmed;
        sourceSize = `{${frame.originalWidth},${frame.originalHeight}}`;
        offsetStr = `{${frame.offsetX},${frame.offsetY}}`;
        textureRect = `{{${frame.x},${frame.y}},{${frame.width},${frame.height}}}`;
    } else if (info.format === 1 || info.format === 2) {
        rotated = frame.rotated;
        trimmed = frame.trimmed;
        sourceSize = frame.sourceSize;
        offsetStr = frame.offset;
        textureRect = frame.frame;
    } else if (info.format === 3) {
        rotated = frame.textureRotated;
        trimmed = frame.trimmed;
        sourceSize = frame.spriteSourceSize;
        offsetStr = frame.spriteOffset;
        textureRect = frame.textureRect;
    }

    subMeta.rotated = !!rotated;
    subMeta.trimType = trimmed ? 'custom' : 'auto';
    subMeta.spriteType = 'normal';

    let rawSize = _parseSize(sourceSize);
    subMeta.rawWidth = rawSize.width;
    subMeta.rawHeight = rawSize.height;

    let offset = _parseVec2(offsetStr);
    subMeta.offsetX = offset.x;
    subMeta.offsetY = offset.y;

    let rect = _parseRect(textureRect);
    subMeta.trimX = rect.x;
    subMeta.trimY = rect.y;
    subMeta.width = rect.w;
    subMeta.height = rect.h;
}

if (modifiedKeys.length > 0) {
    console.warn('[SpriteAtlas import] Some of the frame keys have been reformatted : ' + JSON.stringify(modifiedKeys));
}

let extractedImageSaveFolder = Path.join(dirName, 'temp_unpack');
// Fs.mkdirSync(extractedImageSaveFolder);

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