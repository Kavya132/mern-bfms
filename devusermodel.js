const mongoose =require('mongoose');

const devuser= new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
    },
    email:{ 
        type:String,
        unique: true,
        required:true,
    },
    mobile:{
        type:Number,
        required:true, 
    },
    role: {
        type: String, // Assuming the role is a string, adjust as needed
        required: true
    },

    password:{
        type:String,
        required:true,
    }
  
    
})

module.exports=mongoose.model('devuser',devuser)