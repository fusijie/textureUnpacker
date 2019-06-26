const Fs = require('fs-extra');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const Colors = require('colors');

const Parser = require('./parser');
const Unpacker = require('./unpacker');

const optionDefinitions = [{
        name: 'file',
        alias: 'f',
        type: String,
    },
    {
        name: 'folder',
        alias: 'd',
        type: String,
    },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
    }
];
const sections = [{
        header: 'A Texture Unpacker Command Line Tool',
        content: 'Use to unpack textureAtlas. \n\n https://github.com/fusijie/textureUnpacker.git'
    },
    {
        header: 'Options',
        optionList: [{
                name: 'file',
                alias: 'f',
                typeLabel: '{underline file}',
                description: 'The plist file to process.'
            },
            {
                name: 'folder',
                alias: 'd',
                typeLabel: '{underline folder}',
                description: 'The folder files to process.'
            },
            {
                name: 'help',
                alias: 'h',
                description: 'Print this usage guide.'
            }
        ]
    }
];

const usage = commandLineUsage(sections);
const options = commandLineArgs(optionDefinitions);

if (options.help) {
    console.log(usage);
} else if (options.file) {
    unpackFile(options.file);
} else if (options.folder) {
    console.log('TODO');
} else {
    console.log("\nYou should specify plist file or folder.\n\nPlease try 'node index.js -h'");
}

function unpackFile(plistPath) {
    if (!Fs.existsSync(plistPath)) {
        console.log(`${plistPath} is not exist.`.red);
        return;
    }

    let parser = new Parser(plistPath);
    parser.parse();

    let textureAtlasPath = parser.getTextureAtlasPath();
    if (!Fs.existsSync(textureAtlasPath)) {
        console.log(`${textureAtlasPath} is not exist.`.red);
        return;
    }

    let unpacker = new Unpacker();
    unpacker.unpack(textureAtlasPath, parser.getSubMetas());
}