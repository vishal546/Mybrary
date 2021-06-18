const express=require("express");
const router=express.Router()
const multer=require("multer")
const path=require("path")
const fs=require("fs")
const Book=require("../models/book")
const Author=require("../models/author")
const uploadPath=path.join("public",Book.coverImageBasePath)
const imageMimeTypes=['image/jpeg', 'image/png', 'images/gif']
var upload=multer({
    dest:uploadPath,
    fileFilter:(req,file,callback)=>{
        callback(null,imageMimeTypes.includes(file.mimetype))
    }
})

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
router.post("/",upload.single('cover'),async (req,res)=>{
  const fileName= req.file !=null ? req.file.filename : null
  console.log(req.body.author);
    const book=new Book({
       title:req.body.title,
       author:req.body.author,
       publishDate:new Date(req.body.publishDate),
       pageCount:req.body.pageCount,
       coverImageName:fileName,
       description:req.body.description
   })

   try{
const newBook=await book.save()
 // res.redirect("authors/${newBook.id}");
 res.redirect("books")
   }catch(err){
       if(book.converImageName!=null)
       {
        removeBookCover(book.coverImageName)
       }
   
renderNewPage(res,book,true)
   }

    })

    function removeBookCover(fileName){
        fs.unlink(path.join(uploadPath,fileName),err=>{
if(err)console.error(err);
        })
    }
    

async function renderNewPage(res,book,hasError=false){
    try{
        const authors=await Author.find({})
       const params={
        authors:authors,
        book:book
    }
    if(hasError)params.errorMessage="Error Creating Book"
        res.render("books/new",params)
        
            }catch{
        
                res.redirect("/books")
            }
}

module.exports=router