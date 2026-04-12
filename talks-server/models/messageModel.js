const mongoose = require('mongoose');

const messageModel = new mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId, 
        ref:'User'},
    content:{type:String, 
        required:true},
    receiver:{type:mongoose.Schema.Types.ObjectId, 
        ref:'User'},
    chat:{type:mongoose.Schema.Types.ObjectId,
        ref:'Chat'},
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent',
    },
},{
    timestamps:true
}); 

const Message = mongoose.model("Message", messageModel);
module.exports = Message;