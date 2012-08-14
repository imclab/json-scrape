var test = require('tap').test;
var createScraper = require('../');
var fs = require('fs');
var chunky = require('chunky');

test('chunks', function (t) {
    t.plan(100);
    
    function scrape () {
        var scraper = createScraper();
        var objects = [];
        
        scraper.on('data', function (obj) {
            objects.push(obj);
        });
        scraper.on('end', function () {
            t.same(objects, [
                { type : 'test', value : 5 },
                { x : 5 },
                [ 1, 2, 3 ],
                [ 'a', 'b', 'c', 'd', 'e' ],
            ]);
        });
        return scraper;
    }
    
    fs.readFile(__dirname + '/data.txt', function (err, src) {
        for (var i = 0; i < 100; i++) (function () {
            var scraper = scrape();
            
            var chunks = chunky(src);
            chunks.forEach(function (chunk) {
                scraper.write(chunk);
            });
            
            scraper.end();
        })();
    });
});