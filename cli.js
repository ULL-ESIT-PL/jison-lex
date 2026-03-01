#!/usr/bin/env node

var version = require('./package.json').version;

var path = require('path');
var fs = require('fs');
var lexParser = require('lex-parser');
var RegExpLexer = require('./regexp-lexer.js');
var { program } = require('commander');

program
  .version(version, '-V, --version')
  .name('jison-lex')
  .description('Lexical analyzer generator used by jison')
  .argument('[file]', 'file containing a lexical grammar')
  .option('-o, --outfile <FILE>', 'Filename and base module name of the generated parser')
  .option('-t, --module-type <TYPE>', 'The type of module to generate (commonjs, js)', 'commonjs')
  .parse(process.argv);

var args = program.args;
var opts = {
  file: args[0],
  outfile: program.opts().outfile,
  'module-type': program.opts().moduleType
};

exports.main = function (opts) {
    if (opts.file) {
        var raw = fs.readFileSync(path.normalize(opts.file), 'utf8'),
            name = path.basename((opts.outfile||opts.file)).replace(/\..*$/g,'');

        fs.writeFileSync(opts.outfile||(name + '.js'), processGrammar(raw, name));
    } else {
        readin(function (raw) {
            console.log(processGrammar(raw));
        });
    }
};

function processGrammar (file, name) {
    var grammar;
    try {
        grammar = lexParser.parse(file);
    } catch (e) {
        try {
            grammar = JSON.parse(file);
        } catch (e2) {
            throw e;
        }
    }

    var settings = grammar.options || {};
    if (!settings.moduleType) settings.moduleType = opts['module-type'];
    if (!settings.moduleName && name) settings.moduleName = name.replace(/-\w/g, function (match){ return match.charAt(1).toUpperCase(); });

    grammar.options = settings;

    return RegExpLexer.generate(grammar);
}

function readin (cb) {
    var stdin = process.openStdin(),
        data = '';

    stdin.setEncoding('utf8');
    stdin.addListener('data', function (chunk) {
        data += chunk;
    });
    stdin.addListener('end', function () {
        cb(data);
    });
}

if (require.main === module)
    exports.main(opts);
