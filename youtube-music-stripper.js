var express = require('express');
var bodyParser = require('body-parser');
var exec = require('child_process').exec;
var handlebars = require('express-handlebars')
  .create({ defaultLayout: 'main' });

var app = express();

//setup handlebars templating engine
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//setup body-parser to get data from forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('home');
});

app.post('/download', function(req, res){
  var url = req.body.url;
  var filename = '';
  exec('youtube-dl --get-filename ' + url, function(error, stdout, stderr){
    if(error){
      console.error('ERROR1:',stderr);
    } else {
      filename = stdout.replace('\n', '');
      filename_terminal = filename.replace(/ /g, '\\ ')
                                  .replace(/\'/g, '\\\'')
                                  .replace(/\(/g, '\\(')
                                  .replace(/\)/g, '\\)')
                                  .replace(/\&/g, '\\&');
      exec('youtube-dl ' + url, function(error, stdout, stderr){
        if(error){
          console.error('ERROR2:', stderr);
        } else {
          var filepath = __dirname + '/' + filename;
          var musicFilename = filename.split('.')[0] + '.mp3';
          var musicFilename_terminal = musicFilename.replace('\n', '')
                                                    .replace(/ /g, '\\ ')
                                                    .replace(/\'/g, '\\\'')
                                                    .replace(/\(/g, '\\(')
                                                    .replace(/\)/g, '\\)')
                                                    .replace(/\&/g, '\\&');
          var musicFilepath = __dirname + '/' + musicFilename;
          exec('ffmpeg -i ' + filename_terminal + ' -vn ' + musicFilename_terminal, function(error, stdout, stderr){
            if(error){
              console.error('ERROR3:',stderr);
            } else {
              res.download(musicFilepath, musicFilename, function(error){
                if(error) {
                  console.error(err);
                }
                exec('rm -rf ' + filename_terminal + ' ' + musicFilename_terminal, function(error, stdout, stderr){
                  if(error){
                    console.error(error);
                  }
                });
              });
            }
          });
        }
      });
    }
  });
});

app.use(function(req, res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' +
              app.get('port') +
              '\npress Ctrl-C to terminate');
});
