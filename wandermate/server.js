const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyparser=require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const flash = require('connect-flash');
var multer =require('multer')
var passport=require('passport');
let Placeinfo = require('./models/Placeinfo');
let Tour_plans = require('./models/tour_plans');
let Guides = require('./models/Guide');
let News = require('./models/News');
let WishList = require('./models/WishList')
let Chatdata = require('./models/Chatdata');
const socketio = require('socket.io');
const http = require('http');


var cookieParser = require('cookie-parser');
var app=express()
//EJS

app.use(expressLayouts);
app.set('view engine','ejs');
app.use(express.static('./static'));
app.use('/uploads', express.static('./uploads'))
app.use(express.static('./uploads'));
app.use('/styles', express.static('styles'))



//db congif
var urlencodedparser=bodyparser.urlencoded({extended:true,limit:'50mb'});
app.use(bodyparser.json({limit:'50mb'}));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,

}));

app.use(urlencodedparser);
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);


app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now()+ '.jpeg' )
  }
})


app.use(multer({ storage: storage }).any());


db=require('./config/keys').MongoURI;


//connect to mong
mongoose.connect(db,{   useNewUrlParser: true,
                        useUnifiedTopology: true
                      })
    .then(()=>console.log('connected to mongodb'))
    .catch(err=>console.log(err))





//Routes

 app.use('/users',require('./routes/users'));
 app.use('/guides',require('./routes/guide'));
 app.use('/tours',require('./routes/tour_guide'));
 app.use('/place',require('./routes/place'));
 app.use('/blog',require('./routes/blog'));
  app.use('/pricing',require('./routes/api'));
app.use('/admin',require('./routes/admin'))
app.use('/',require('./routes/landing'));
app.use('/wanderlist',require('./routes/wishlist'))

const Suggestions = require('./models/Suggestion')

 app.get('/places/:name', function(req, res){

function sort(arr,dict){
  if(! Object.keys(dict).length){
    for(var i=0; i<arr.length;i++){
      dict[arr[i]] = 1
    }
    return dict
  }
  for(i = 0; i < arr.length; i++){
    for(var k in dict){
      if(k === arr[i]){
        dict[arr[i]] += 1
      }
      else{
        var flag=0
        for(var k in dict){
          if(k == arr[i]){
            flag=1
          }
        }
        if (flag==0){
          dict[arr[i]]=1
        }
      }
    }
  }
  return dict;
}
var arr = [];
 var fml =[];
 var dict = {}

 var place = req.params.name.toLowerCase();
 console.log('main')
 console.log(place)
 var item=[]
 Suggestions.find({},function(err,sug){
console.log('main1')
 console.log(sug)
 for(i = 0; i < sug.length; i++){
   fml = Object.values(sug[i])
   fml = fml[fml.length-3]
   fml = Object.values(fml)
   for(j = 0; j < fml.length; j++){
     if(place == fml[2][j]){
       // push into array
       arr.push(fml[2])
     }
   }
 }
 for(i = 0; i < arr.length; i++){
   dict = sort(arr[i],dict)
 }
 delete dict[place];

 var items = Object.keys(dict).map(function(key) {
   return [key, dict[key]];
 });

 // Sort the array based on the second element
 items.sort(function(first, second) {
   return second[1] - first[1];
 });

 // Create a new array with only the first 5 items
console.log('heyy')
 console.log(items.slice(0, 5));
 items=items.slice(0,5);

 for (var i = 0; i < items.length; i++) {
   item.push(items[i][0])
 }
});



   console.log('here')
   Placeinfo.findOne({name: req.params.name}, function(err, places){
     if(err){
       console.log(err);
     } else {
       console.log('camee')

       Tour_plans.find({city: req.params.name}, function(err, plans){
          if(err){
            console.log(err);
          }else{
            var plans=plans
            console.log(plans.length)
            for(var i=0;i<plans.length;i++){
              console.log('------------')
              console.log(plans[i]._id);
              var dates=[]
              num_of_days=plans[i].num_of_days
              console.log(num_of_days)
              Guides.findOne({"availabledates.planid":'5dd0a1783691d951dc5ba363'},function(err,guide){
                if(err){
                  console.log(err);
                }else{
                  console.log(guide);
                  if(guide){
                    console.log(guide.name);
                    console.log(i);
                    console.log('roshan');

                  for (var j=0;j<guide.availabledates.length;j++){
                    if(guide.availabledates[j].plantype=='owntrip' && guide.availabledates[j].totalbookings=='0'){
                      console.log(guide.availabledates[j].date)
                      dates.push(guide.availabledates[j].date)
                    }
                  }
                  console.log('dtaes');
                  console.log(dates);

                  avail=[]

                  function check(d1,d2){
                    var today= new Date(d1);

                    var x= today.getFullYear().toString()+'/'+((today.getMonth()+1)<10?'0'+(today.getMonth()+1).toString():(today.getMonth()+1).toString())+'/'+(today.getDate()<10?'0'+(today.getDate()).toString():(today.getMonth()).toString())
                    console.log(x);

                    var next = new Date();
                    next.setDate(today.getDate()+num_of_days-1);
                    var y=next.getFullYear().toString()+'/'+(next.getMonth()+1).toString()+'/'+next.getDate().toString()
                    console.log(y);

                    if(today.getFullYear()==d1.getFullYear() && today.getMonth()==d1.getMonth() && today.getDate()==d1.getDate()){
                      console.log('asdfghj');
                      avail.push({start:'x',end:'y'})
                      return true
                    }
                  }


                  for(var k=0;k<dates.length-num_of_days+1;k++){
                    console.log(j);
                    console.log((new Date(dates[k])));
                    console.log((new Date(dates[k+num_of_days-1])));
                    console.log(check(new Date(dates[k]), new Date(dates[k+num_of_days-1])))
                    console.log('done');

                  }
                }
                }
              })
            }






            Guides.find({city: req.params.name.toLowerCase()}, function(err, guides){
               if(err){
                 console.log(err);
               }else{
                 News.find({}, function(err, news){
                   if(err){
                     console.log(err);
                   }else{
                     console.log(item)
                     WishList.find({username: req.user.name}, function(err, boards){
                       console.log(boards[0].boards);
                       res.render('main', {user:req.user,places:places, plans:plans, guides:guides, news:news,sugg:item,boards:boards[0].boards});
                     })
                   }
                 })
               }
            })
          }
       })
     }
   });




 });

 app.get('/places/', function(req, res){
   res.render('form');
 });

 app.post('/places', urlencodedparser, function (req, res) {
   var cityName = req.body.city;
   res.redirect('/places/'+cityName);
 });

 const server = http.createServer(app);
 const io = socketio(server);


 var count=0;

 app.get('/chat/:username/:guidename', function(req, res){
   var username = req.params.username;
   var guidename = req.params.guidename;
   var usertype = req.user.usertype;
   count=count+1;

   Chatdata.find({username:username, guidename:guidename}, function(err, places){
     if(err){
       console.log(err);
     } else {
       Chatdata.find({username:username}, function(err, chats){
         if(err){
           console.log(err)
         }else{
           res.render('chat', {data:places, usertype:usertype, otherchats:chats});
         }
       });
     }
   });

   io.on('connection', function(socket){

 if(count==1){

         console.log(count);

             sendStatus = function(s){
               io.emit('status', s);
             }
             socket.on('join', function(room){
                 socket.join(room);
                 console.log(room);
                   // socket.broadcast.to(username+'-'+guidename).emit('output', res);
             });

             socket.on('sendlocation', (coords)=>{
               var type = coords.type;
               var time = coords.time;
               var msg = 'https://maps.google.com/?q'+coords.lat+','+coords.lng;
               Chatdata.updateOne(
                 { username: username, guidename:guidename},
                 { $push: {messages: {text: msg, time: time, sentby: type}} },
                 function(){
                   io.to(username+'-'+guidename).emit('output', { username: username, guidename:guidename, messages: [{text: msg, sentby: type, time: time}]});
                   sendStatus({
                     message: 'Message sent',
                     clear: true
                   });
                 }
               );
             });

             socket.on('input', function(data){

               let type = data.type;
               let msg = data.msg;
               let time = data.time;
               console.log(type);
               console.log(msg);
               console.log(time);

               if (msg == ''){
                 sendStatus("Please enter a message.");
               } else {



                 Chatdata.updateOne(
                   { username: username, guidename:guidename},
                   { $push: {messages: {text: msg, time: time, sentby: type}} },
                   function(){
                     io.to(username+'-'+guidename).emit('output', { username: username, guidename:guidename, messages: [{text: msg, sentby: type, time: time}]});
                     console.log(username+'-'+guidename);
                     sendStatus({
                       message: 'Message sent',
                       clear: true
                     });
                   }
                 );
               }
             });

             socket.on('dis', function(users){
               console.log('socket');
               console.log(users);
               username = users.uname;
               guidename = users.gname;
               socket.disconnect();
             });
             count=0
 }


   });

 });




app.listen(3000);
console.log('you are listening to port 3000');
