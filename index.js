const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const Parser = require('./parser');
const Unpacker = require('./unpacker');

const optionDefinitions = [{
        name: 'file',
        alias: 'p',
        type: String,
    },
    {
        name: 'folder',
        alias: 'f',
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
                name: 'p',
                typeLabel: '{underline file}',
                description: 'The plist file to process.'
            },
            {
                name: 'f',
                typeLabel: '{underline folder}',
                description: 'The folder files to process.'
            },
            {
                name: 'help',
                description: 'Print this usage guide.'
            }
        ]
    }
];
const usage = commandLineUsage(sections);

const options = commandLineArgs(optionDefinitions);
if (options.help) {
    console.log(usage);
} else {
    console.log(options);
}

// let parser = new Parser('/Users/jacky/Lab/textureUnpacker/samples/iconUser.plist');
// parser.parse();

// let unpacker = new Unpacker();
// unpacker.unpack(parser.getTextureAtlasPath(), parser.getSubMetas());