var through = require('through');
var Parser = require('jsonparse');

module.exports = function (opts) {
    if (!opts) opts = {};
    
    var parser, value, error;
    function createParser () {
        parser = new Parser;
        
        parser.onValue = function () {
            if (this.value !== undefined) {
                value = this.value;
            }
        };
        
        parser.onError = function (err) {
            if (!error) {
                error = err;
                if (value !== undefined) {
                    stream.emit('data', value);
                    value = undefined;
                }
            }
        };
    }
    
    function write (buf) {
        if (parser) {
            parser.write(buf);
            return;
        }
        
        for (var i = 0; i < buf.length; i++) {
            var s = String.fromCharCode(buf[i]);
            if (s === '[' || s === '{') {
                createParser();
                var res = parser.write(buf.slice(i, buf.length));
                if (error) {
                    error = undefined;
                    parser = undefined;
                }
                else {
                    break;
                }
            }
        }
    }
    
    function end () {
        if (value !== undefined) {
            stream.emit('data', value);
        }
        stream.emit('end');
    }
    
    var stream = through(write, end);
    return stream;
};
