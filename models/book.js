const mongoose=require("mongoose");
// const path=require("path")
// const coverImageBasePath='uploads/bookCovers'

const bookSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    
    },
    publishDate:{
        type:Date,
        required:true
    },
    pageCount:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        required:true,
        default:Date.now
    },
    // coverImageName:{
    //     type:String,
    //     required:true
    // },

    coverImage:{
        type:Buffer,
        required:true
    },

    coverImageType:{
        type:String,
        required:true
    },

    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Author'
    }

})

//virtual acts as same like fields in schema but we can also access schema objects key in it

// bookSchema.virtual("coverImagePath").get(function(){
//     if(this.coverImageName!=null)
//     {
// return path.join("/",coverImageBasePath,this.coverImageName)
//     }
// })


bookSchema.virtual("coverImagePath").get(function(){
    if(this.coverImage!=null && this.coverImageType!=null)
    {
return  `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})


module.exports=mongoose.model("Book",bookSchema);
// module.exports.coverImageBasePath=coverImageBasePath
