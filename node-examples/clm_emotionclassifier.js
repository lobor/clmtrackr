var clm = require('../js/clm.js');
var Canvas = require('canvas');
var fs = require('fs');
var emotionClassifier = require('./js/emotion_classifier.js');
var emotionModel = require('./js/emotion_model.js');
var pModel = require('../models/model_pca_20_svm_emotionDetection.js');

var Image = Canvas.Image;

// grab image from command line args
console.log(process.argv)
var imageName = '../examples/media/franck_01829.jpg';
if (process.argv.length > 2){
    imageName = process.argv[2];
}
console.log(__dirname + '/' + imageName)
console.log('length ', process.argv.length)
var img = new Image();
var imgFile = fs.readFileSync(__dirname + '/' + imageName);
img.src = imgFile;
var canvas = new Canvas(img.width, img.height);
var overlay = new Canvas(img.width, img.height);
var ctx = canvas.getContext('2d');
var overlayCtx = overlay.getContext('2d');
console.log(img.width, img.height)
ctx.drawImage(img, 0,0);

var ctrack = new clm.tracker({
    'searchWindow': 11,
    'scoreThreshold': 0.4 

});
ctrack.setResponseMode('single',  ['lbp']);
ctrack.init(pModel);
ctrack.start(canvas);

var ec = new emotionClassifier();
ec.init(emotionModel);
var emotionData = ec.getBlank();    

ctrack.emitter.on('clmtrackrNotFound', function(){
    console.log('clmtrackrNotFound');
});

ctrack.emitter.on('clmtrackrLost', function(){
    console.log('clmtrackrLost');
});

var c = 0;
ctrack.emitter.on('clmtrackrIteration', function(){
    console.log('clmtrackrIteration', c++);
    //var cp = ctrack.getCurrentParameters();
    //var er = ec.meanPredict(cp);
    //console.log(er);
});

function getHighestEmotion(emotionList){
    var highestEmotionRank = 0;
    var highestEmotionName = 'none';
    for (var a in emotionList){
        if (emotionList[a].value > highestEmotionRank){
            highestEmotionRank = emotionList[a].value; 
            highestEmotionName = emotionList[a].emotion;
        }
    }
    return highestEmotionName;
}

ctrack.emitter.on('clmtrackrConverged', function(){
    console.log('clmtrackrConverged');
    var cp = ctrack.getCurrentParameters();
    var er = ec.predict(cp);
    console.log(er);
    console.log(getHighestEmotion(er));
});

