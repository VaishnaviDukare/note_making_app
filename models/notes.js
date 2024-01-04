const mongoose=require("mongoose");
const noteSchema=mongoose.Schema({
    title:{type:String,required:true ,maxLength: 255},
    content:{type:String,required:true,maxLength: 1000},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;