const mongoose=require('mongoose')
require('dotenv').config()
mongoose.connect(process.env.MONGOLABURL).then(()=>console.log("dbconnected")).catch((err)=>console.log("not"))

const express=require('express')
const app=express()

const session = require('express-session');

// app.use(session({ mysessionsec }));

app.use(session({
  secret: 'your-secret-key-here',
  resave: false,
  saveUninitialized: true,
  // You can also configure other session options here if needed
}));

//for user  route
const userRoute=require('./routes/userRoutes')
app.use('/',userRoute)

const path=require('path')
const views=path.join(__dirname,'views/user')
//for admin routes 
const adminRoute=require('./routes/adminRoutes')
app.use('/admin',adminRoute)


app.set('view engine','ejs');
app.set('views', views);

app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'public/admin')))

app.get('*', function(req, res, next) {
    const err = new Error('Not Found');
    err.statusCode = 404;
    next(err);
  });
  
  app.use((err,req,res,next)=>{
    if( err.statusCode==404){
        res.render('404')
    }
    res.statusCode=500
    return res.render('500', { statusCode: res.statusCode });
    
  })

app.listen(3000,()=>{
    console.log("Server Started");
})  ;
