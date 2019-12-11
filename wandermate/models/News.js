const mongoose = require('mongoose');


const newsSchema = mongoose.Schema({

  guide:{type:String},
  img:{type:String},
  guideimg:{type:String},
  title:{type:String},
  news:{type:String},
  upvotes:{type:Array,default:void 0},
  time:{type:Date,default:Date.now},
  array_length:{type:Number,default:0}
})
const News = mongoose.model('News',newsSchema)
module.exports=News;
