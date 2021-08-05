const express=require("express");
const router=express.Router()
// const multer=require("multer")
// const path=require("path")
// const fs=require("fs")
const Book=require("../models/book")
const Author=require("../models/author")
// const uploadPath=path.join("public",Book.coverImageBasePath)
const imageMimeTypes=['image/jpeg', 'image/png', 'images/gif']
// var upload=multer({
//     dest:uploadPath,
//     fileFilter:(req,file,callback)=>{
//         callback(null,imageMimeTypes.includes(file.mimetype))
//     }
// })

//All Book route
router.get("/",async (req,res)=>{
    let query=Book.find()
    if(req.query.title !=null && req.query.title != '')
    {
        query=query.regex("title",new RegExp(req.query.title,'i'))
    }
    if(req.query.publishBefore !=null && req.query.publishBefore != '')
    {
        query=query.lte("publishDate",req.query.publishBefore)
    }

    if(req.query.publishAfter !=null && req.query.publishAfter != '')
    {
        query=query.gte("publishDate",req.query.publishAfter)
    }

const books=await query.exec()

    try{
        res.render("books/index",{
            books:books,
            searchOptions:req.query
        })

    }catch{
        res.redirect("/")
    }


});

//New Book Route
router.get("/new",async (req,res)=>{

   renderNewPage(res,new Book())
    
   
    });

//Create Book Route
router.post("/",/*upload.single('cover'),*/async (req,res)=>{
 // const fileName= req.file !=null ? req.file.filename : null
  console.log(req.body.author);
    const book=new Book({
       title:req.body.title,
       author:req.body.author,
       publishDate:new Date(req.body.publishDate),
       pageCount:req.body.pageCount,
    //    coverImageName:fileName,
       description:req.body.description
   })

   saveCover(book,req.body.cover);

   try{
const newBook=await book.save()
  res.redirect(`books/${newBook.id}`);
 
   }catch(err){
    //    if(book.converImageName!=null)
    //    {
    //     removeBookCover(book.coverImageName)
    //    }
   
renderNewPage(res,book,true)
   }

    })

//     function removeBookCover(fileName){
//         fs.unlink(path.join(uploadPath,fileName),err=>{
// if(err)console.error(err);
//         })
//     }


router.get("/:id",async (req,res)=>{

    try{
const book=await Book.findById(req.params.id).populate("author").exec()
res.render("books/show",{book:book})
    }catch{
       res.redirect("/") 
    }

})

router.get("/:id/edit",async(req,res)=>{
try{
const book=await Book.findById(req.params.id)
renderEditPage(res,book)
}catch{

}

})


router.put("/:id",async (req,res)=>{
    
    
   let book1
      try{
        book1 =await Book.findById(req.params.id)
        book1.title=req.body.title
        book1.author=req.body.author
        book1.publishDate=new Date(req.body.publishDate)
        book1.pageCount=req.body.pageCount
        book1.description=req.body.description

        if(req.body.cover!=null && req.body.cover!=="")
        {
            saveCover(book1,req.body.cover)
        }
       const newBook= await book1.save()
     res.redirect(`/books/${newBook.id}`);
    
      }catch(err){
          console.log(err);
       if(book1!=null)
       {
        renderEditPage(res,book1,true)

       }else{
           redirect("/")
       }
      
      }
   
       })


router.delete("/:id",async(req,res)=>{
let book
try{
book =await Book.findById(req.params.id)
await book.remove()
res.redirect("/books")
}catch{
    if(book!=null)
    {
        res.render("books/show",{
            book:book,
            errorMessage:"Could not remove book"
        })
    }else{
        res.redirect("/")
    }

}

})
    

async function renderNewPage(res,book,hasError=false){
    renderFormPage(res,book,"new",hasError)
}


async function renderEditPage(res,book,hasError=false){
    renderFormPage(res,book,"edit",hasError)
}

async function renderFormPage(res,book,form,hasError=false){
    try{
        const authors=await Author.find({})
       const params={
        authors:authors,
        book:book
    }
    if(hasError)
    {
        if(form==="edit")
        {
            params.errorMessage="Error Updating Book"
        }else{
            params.errorMessage="Error Creating Book"
        }
    }
    
        res.render(`books/${form}`,params)
        
            }catch{
        
                res.redirect("/books")
            }
}


function saveCover(book,coverEncoded){
    if(coverEncoded==null)return
    const cover=JSON.parse(coverEncoded)
    if(cover!=null && imageMimeTypes.includes(cover.type))
    {
        book.coverImage=new Buffer.from(cover.data,"base64")
        book.coverImageType=cover.type
    }

}



module.exports=router

