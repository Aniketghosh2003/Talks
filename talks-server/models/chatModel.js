const mongoose = require('mongoose');   

const chatModel = new mongoose.Schema({
    chatName:{type:String, required:true},
    isGroupchat:{type:Boolean, required:true},
    users:[
        {type:mongoose.Schema.Types.ObjectId, 
        ref:'User'}
    ],
    lastMessage:[
        {type:mongoose.Schema.Types.ObjectId, 
        ref:'Message'}
    ]
},
{
    timestamps:true
});

const Chat = mongoose.model('Chat', chatModel);
module.exports = Chat;