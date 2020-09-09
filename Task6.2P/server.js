const express = require("express")
const bodyParser = require("body-parser")
const https = require("https")
const mongoose = require("mongoose")
const validator = require("validator")
const alert = require("alert")
const Registration = require("./registration.js")
const bcrypt = require("bcrypt")
const salt = bcrypt.genSaltSync(10);
var User = mongoose.model("registration")
const server = require("./server.js")

const app = express();
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))

app.get('/',(req,res)=>{
    res.sendFile(__dirname + "/reqlogin.html")
})

mongoose.connect("mongodb://localhost:27017/iCrowdTaskDB",{useNewUrlParser:true, useUnifiedTopology:true})

app.route('/workers')
.post((req,res)=>{
    const task = new Registration({
        livecountry: req.body.country,
        fname: req.body.first_name,
        lname:  req.body.last_name,
        Password: req.body.password,
        Email: req.body.email,
        Address: req.body.address,
        Address2: req.body.address2,
        City: req.body.city,
        State: req.body.region,
        Zip: req.body.zip,
        Phonenumber: req.body.phone
    })
    task.save((err) =>{
        if(err){res.send(err)}
        else res.send('successful')
    })
})
.get((req, res) =>{
    Registration.find((err,taskList)=>{
        if (err) {res.send(err)}
        else {res.send(taskList)}
    })
})
.delete((req, res) =>{
    Registration.deleteMany((err)=>{
        if(err){res.send(err)}
        else{res.send('Successfully')}
    })
})

app.route('/workers/:id')
.get((req, res)=>{
    Registration.findOne({_id:req.params.id},(err,foundTask)=>{
        if(foundTask){res.send(foundTask)}
        else res.send('No Matched Task Found')
    })
})
.put((req, res)=>{
    Registration.update(
        {_id: req.params.id},
        {   livecountry: req.body.country,
            fname: req.body.first_name,
            lname:  req.body.last_name,
            Password: req.body.password,
            Email: req.body.email,
            Address: req.body.address,
            Address2: req.body.address2,
            City: req.body.city,
            State: req.body.region,
            Zip: req.body.zip,
            Phonenumber: req.body.phone},
        {overwrite:true},
        (err)=>{
            if(err){res.send(err)}
            else{res.send('successful')}
        }
    )
})

.patch((req, res)=>{
    Registration.update(
        {_id: req.params.id},
        {$set:{Phonenumber: req.body.phone,
            Address: req.body.address,
            Address2: req.body.address2,
            Password: req.body.password,}},
        (err)=>{
            if(!err){res.send('Successful')}
            else res.send(err)
        }
    )
})
.delete((req, res)=>{
    Registration.deleteMany(
        {_id: req.params.id},
        (err)=>{
            if(err){res.send(err)}
            else{res.send('successful')}
        }
    )
})

app.get('/reqsignup.html',function (req,res) {
    res.sendFile(__dirname+"/"+"reqsignup.html");
})

app.post('/reqlogin',(req,res)=>{

    
    const country = req.body.country
    const firstname = req.body.first_name
    const lastname = req.body.last_name
    const email = req.body.email
    let password = req.body.password
    let confirm = req.body.confirmpassword
    const address = req.body.address
    const address2 = req.body.address2
    const city = req.body.city
    const state = req.body.region
    const zip = req.body.zip
    const tel = req.body.phone
    let hash = bcrypt.hashSync(password, salt)
    password = hash
    confirm = hash
    module.exports.hash = hash;
    module.exports.confirm = confirm;
    const apiKey = "4ac8b2c41b55629d3a2f141a7e886a39-us17"
    const list_id ="59ac81e82b"
    const url = "https://us17.api.mailchimp.com/3.0/lists/59ac81e82b"
    const data = {
        members:[{
            email_address:email,
            status: "subscribed",
            merge_fields:{
                FNAME:firstname,
                LNAME:lastname
            }
        }]
    }
    jsonData = JSON.stringify(data)
        
    const options={
        method: "POST",
        auth:"Garrett:4ac8b2c41b55629d3a2f141a7e886a39-us17"
    }

    const request = https.request(url,options,(response)=>{
        response.on("data",(data)=>{
            console.log(JSON.parse(data))
        })
    })

    request.write(jsonData)
    request.end()
    console.log(firstname,lastname,email)

    const registration = new Registration({
        livecountry:country,
        fname: firstname,
        lname: lastname,
        Password: password,
        Email: email,
        Address:address,
        Address2:address2,
        City:city,
        State:state,
        Zip:zip,
        Phonenumber:tel
    })
    registration.save(function(error){
        if(error){
             if(validator.isEmpty(firstname)){
                alert("Please input first name")
            }
            else if(validator.isEmpty(country)){
                alert("Please choose a country")
            }
            else if(validator.isEmpty(lastname)){
                alert("Please input last name")
            }
            else if(validator.isEmpty(email)){
                alert('Please input email address!')
            }
            else if(!validator.isEmail(email)){
                alert("Email is not valid!")
            }
            else if(!validator.isLength(password,{min:8})){
                alert('password should be at least 8 characters!')
            }
            else if(validator.isEmpty(password)){
                alert('Please input password!')
            }
            else if(!validator.equals(confirm, password)){
                alert('Password does not match with Confirm password!')
            }
            else if(validator.isEmpty(address)){
                alert('Please input address!')
            }
            else if(validator.isEmpty(city)){
                alert('Please input city!')
            }
            else if(validator.isEmpty(state)){
                alert('Please input state!')
            }
            else if((!validator.equals(tel,""))&&(!validator.isMobilePhone(tel))){
                alert('Phone number is not valid!')
            }
        }
        else{
            if(res.statusCode === 200){
                res.sendFile(__dirname + "/reqlogin.html")
            }
            else 
        {
            res.sendFile(__dirname + "/fail.html")
        }
        }
})
})

app.post('/reqtask',function (req,res) {
    var email=req.body.email;
    var pwd=req.body.password;
    
        User.findOne({Email:email},function (error,result) {
            if (result==null)
            {
                res.sendFile(__dirname + "/" + "fail.html" );
            }
            else
            {
                bcrypt.compare(pwd, result.Password).then(function(result) {
                    if(result==null)
                    {
                        res.sendFile(__dirname + "/" + "fail.html" );
                    }
                    else{
                        res.sendFile(__dirname + "/" + "reqtask.html" );
                    }
                });
                
            }
        })

})


app.listen(8000,(req,res)=>{
    console.log("Server is running on port 8000")
})

