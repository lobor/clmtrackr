var clm = require('../js/clm.js');
var Canvas = require('canvas');
var fs = require('fs');
var pModel = JSON.parse(fs.readFileSync(__dirname + '/../models/model_pca_20_svm.json', 'utf8'));

var Image = Canvas.Image;
var canvas = new Canvas(625,500);
var overlay = new Canvas(625,500);
var ctx = canvas.getContext('2d');
var overlayCtx = canvas.getContext('2d');

var img = new Image();
var imgFile = fs.readFileSync(__dirname + '/../examples/media/franck_01829.jpg');
img.src = imgFile;
ctx.drawImage(img, 0,0);

var ctrack = new clm.tracker({stopOnConvergence : true});
ctrack.init(pModel);
ctrack.start(canvas);

ctrack.emitter.on('clmtrackrNotFound', function(){
    console.log('clmtrackrNotFound');
});
ctrack.emitter.on('clmtrackrIteration', function(){
    console.log('clmtrackrIteration');
});

ctrack.emitter.on('clmtrackrConverged', function(){
    overlayCtx.clearRect(0, 0,625, 500);
    ctrack.draw(overlay);
    var out = fs.createWriteStream(__dirname + '/test.png');
    var stream = overlay.createPNGStream();
    stream.on('data', function(chunk){
        out.write(chunk);
    });

    stream.on('end', function(){
        console.log('image saved!');
    });
    console.log('clmtrackrConverged');
});




