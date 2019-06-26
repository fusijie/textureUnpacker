const Fs = require('fs-extra');
const Plist = require('plist');
const Path = require('path');

const SpriteFrame = require('./sprite-frame');

const BRACE_REGEX = /[\{\}]/g;
const PATH_SEPERATOR = /[\\\/]/g;


class Parser {
    constructor(plistPath) {
        this.plistPath = plistPath;
        this.textureAtlasPath = '';
        this.subMetas = {};
    }

    parse() {
        const plistInfo = Plist.parse(Fs.readFileSync(this.plistPath, 'utf-8'));

        const info = plistInfo.metadata;
        const dirName = Path.dirname(this.plistPath);
        this.textureAtlasPath = Path.join(dirName, info.realTextureFileName || info.textureFileName);

        const frames = plistInfo.frames;
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

            let subMeta = new SpriteFrame();
            this.subMetas[metaKey] = subMeta;

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
            } else {
                console.log('sprite frame format is not support'.red);
            }

            subMeta.rotated = !!rotated;

            let rawSize = this._parseSize(sourceSize);
            subMeta.rawWidth = rawSize.width;
            subMeta.rawHeight = rawSize.height;

            let offset = this._parseVec2(offsetStr);
            subMeta.offsetX = offset.x;
            subMeta.offsetY = offset.y;

            let rect = this._parseRect(textureRect);
            subMeta.trimX = rect.x;
            subMeta.trimY = rect.y;
            subMeta.width = rect.w;
            subMeta.height = rect.h;
        }

        if (modifiedKeys.length > 0) {
            console.log(`Some of the frame keys have been reformatted : ${JSON.stringify(modifiedKeys)}`.green);
        }
    }

    getTextureAtlasPath() {
        return this.textureAtlasPath;
    }

    getSubMetas() {
        return this.subMetas;
    }

    _parseSize(sizeStr) {
        sizeStr = sizeStr.slice(1, -1);
        let arr = sizeStr.split(',');
        let width = parseInt(arr[0]);
        let height = parseInt(arr[1]);
        return {
            width: width,
            height: height
        };
    }

    _parseVec2(vec2Str) {
        vec2Str = vec2Str.slice(1, -1);
        var arr = vec2Str.split(',');
        var x = parseInt(arr[0]);
        var y = parseInt(arr[1]);
        return {
            x: x,
            y: y
        };
    }

    _parseRect(rectStr) {
        rectStr = rectStr.replace(BRACE_REGEX, '');
        let arr = rectStr.split(',');
        return {
            x: parseInt(arr[0] || 0),
            y: parseInt(arr[1] || 0),
            w: parseInt(arr[2] || 0),
            h: parseInt(arr[3] || 0)
        };
    }
}

module.exports = Parser;