const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  mobile: { type: String },
  address: { type: String, required: true },
  aadharCardNumber: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
  isVoted: { type: Boolean, default: false },
  voterId: { type: String, unique: true },
  username: { type: String }
}, {
  timestamps: true 
});


//pre is a middleware function it is triggered when we apply save operation
userSchema.pre('save',async function(next){    
const person=this; //here 'this' represents that we apply save operation on any record before that premiddleware is called so all the data is saved in person variable

//hash the password only if it has been modified /new
    if(!person.isModified('password')) return next();

    try{
    //hash password generate
    const salt=await bcrypt.genSalt(10);

    //hash password
    const hashpass=await bcrypt.hash(person.password,salt);
    //override the plain password with the hash one
    person.password=hashpass;
    next();
}
catch(err){
    return next(err);
}
})     

userSchema.methods.comparePassword=async function(candidatepass){
    try{
        const isMatch=await bcrypt.compare(candidatepass,this.password);
        return isMatch;

    }catch(err){
        throw err;
    }
}

const User=mongoose.model('user',userSchema);
module.exports=User;