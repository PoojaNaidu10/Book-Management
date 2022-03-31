const { isValidObjectId } = require("mongoose")
const BookModel = require("../Model/BookModel")
const UserModel = require("../Model/UserModel")
const ReviewModel = require("../Model/ReviewModel")

const isValid = function (value) {
  if (typeof value == undefined || value == null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};
  
const isValidString = function(value){
  if(typeof value === 'string' && value.trim().length === 0) return false;
  return true;
}

  const isBodyRequestValid = function (requestBody) {
    return Object.keys(requestBody).length > 0
  }

  function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
  }

 


const CreateBook = async function (req, res){
    try{
         let requestBody=req.body
        
         if(!isBodyRequestValid(requestBody)){
            return res.status(400).send({status:false, msg:"No input provided"})
             }
        
          const {title,excerpt,userId,ISBN,category,subcategory,reviews,releasedAt} = requestBody

          if(!isValid(title)){
            return  res.status(400).send({status:false, msg:"title is required"})
          }

          const isTitleUsed = await BookModel.findOne({title})
          if (isTitleUsed) {
            return res.status(400).send({status:false, msg:"title should be unique"})
          
         }

         if(!isValid(excerpt)){
          return  res.status(400).send({status:false, msg:"excerpt is required"})
        }

        if(!isValid(userId)){
          return   res.status(400).send({status:false, msg:"userId is required"})
        }

        const isUserIdExist = await UserModel.findOne({ _id:userId})
        if (!isUserIdExist) {
           return res.status(400).send({status:false, msg:"The userId doen't exist in user collection"})
        }

        if(!isValid(ISBN)){
            res.status(400).send({status:false, msg:"ISBN is required"})
        }

        const isISBNExist = await BookModel.findOne({ISBN})
        if (isISBNExist) {
           return res.status(400).send({status:false, msg:"The ISBN already exist in Book collection"})
        }

        if(!isValid(category)){
          return   res.status(400).send({status:false, msg:"category is required"})
        }

        if(!isValid(subcategory)){
          return  res.status(400).send({status:false, msg:"subcategory is required"})
        }

        if(!isValid(reviews)){
          return  res.status(400).send({status:false, msg:"reviews is required"})
        }

        if(!isValidDate(releasedAt)){
        return  res.status(400).send({status:false, msg:"releasedAt is not valid"})
      }
        

         const NewBook = await BookModel.create(requestBody)
         res.status(201).send({status:true, msg:"New Book created", data:NewBook})

    }
    catch(error){
       res.status(500).send({status:false, mag:error.msg})
    }
}

let getBooks = async function (req, res) {
  try {

      let data = req.query

      if (!isBodyRequestValid(data)) {
          let search1 = await BookModel.find({ isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1, reviews: 1, releasedAt: 1 }).sort({ title:1 })
          if (!search1) { return res.status(404).send({ status: false, msg:'no data found' }) }
          return res.status(200).send({ status: true, msg: search1 })
      }
      const filterquery = { isDeleted: false }
      const {userId, category, subcategory } = data


if(!isValidString(userId)){

   return res.status(400).send("invalid userId")}

       if (isValid(userId) && isValidObjectId(userId)) { filterquery.userId = userId }

       if(userId){
           if(!isValidObjectId(userId)){return res.status(400).send({status:false,msg:"invalid id"})}
       }

      if (isValid(category)) { filterquery.category = category.trim() }

      if (!isValidString(category)) { return res.status(400).send({ staus: false, msg: "category required" }) }

      if (isValid(subcategory)) { filterquery.subcategory = subcategory.trim() }

      if (!isValidString(subcategory)) { return res.status(400).send({ status: false, msg: "subcategory is required" }) }

      const searchBooks = await BookModel.find(filterquery).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1, reviews: 1, releasedAt: 1 }).sort({ title:1})

      if (Array.isArray(searchBooks) && searchBooks.length == 0) { return res.status(404).send({ status: false, msg: "No books found" }) }

      res.status(200).send({ status: true, msg: searchBooks })

  }
  catch (err) { res.status(500).send({ status: false, error: err.message }) }
}




const getreview = async function(req,res){
    try {
      let result = {}
      let review = []
      let bookId = req.params.bookId
  
      if (!bookId)
        return res.status(400).send({ status: false, msg:"Please Provide bookId" })
  
  
      let BookDetail = await BookModel.findOne({ _id: bookId })
      if (!BookDetail)
        res.status(400).send({ status: false, msg:"bookId not Found" })
  
      let reviewDetails = await ReviewModel.find({ bookId: BookDetail._id })
      if (!reviewDetails) {
        res.status(400).send({ status: false, msg: "please provide review details" })
      }
      let bookData = {
        _id:BookDetail._id,
        title: BookDetail.title,
        excerpt: BookDetail.excerpt,
        userId: BookDetail.userId,
        category: BookDetail.category,
        subcategory: BookDetail.subcategory,
        reviews: BookDetail.reviews,
        deletedAt: BookDetail.deletedAt,
        releasedAt: BookDetail.releasedAt,
        createdAt: BookDetail.createdAt,
        updatedAt: BookDetail.updatedAt,
       
      }
      for (let i = 0; i < reviewDetails.length; i++) {
        result = {
          _id:reviewDetails[i]._id,
          reviewedBy: reviewDetails[i].reviewedBy,
          reviewedAt: reviewDetails[i].reviewedAt,
          rating: reviewDetails[i].rating,
          review: reviewDetails[i].review
        }
        review.push(result)
      }
      bookData["reviewsData"] = review
      console.log(bookData)
      res.status(200).send({ status: true, data: bookData })
    }
    catch (error) {
      console.log(error)
      res.status(500).send({ status: false, msg: error.message })
    }
  }

  const updateBook = async function (req, res) {
    try {
        let Id = req.params.bookId;
        
        let { title, excerpt, releasedAt, ISBN } = req.body;

        if(!isValidObjectId(Id)){return res.status(400).send({status:false, msg:"this is the invalid objectId"})}

        if (!isValidString(title)) {
            res.status(400).send({ status: false, msg: "title is required for updation" })
            return
        }
        const titleAlreadyUsed = await BookModel.findOne({ title });
        if (titleAlreadyUsed) {
            res.status(400).send("tittle alerady exist");
            return
        }
        if (!isValidString(excerpt)) {
            res.status(400).send({ status: false, msg: "exceerpt is required for updation" })
            return
        }

        if (!isValidString(ISBN)) {
            res.status(400).send({ status: false, msg: "ISBN is required for updation" })
            return
        }
        const ISBNAlreadyUsed = await BookModel.findOne({ ISBN });
        if (ISBNAlreadyUsed) {
            return res.status(400).send("ISBN is  alerady exist");
        }
        if (!isValidDate(releasedAt)) {
            res.status(400).send({ status: false, msg: "releasedAt is required for updation" })
            return
        }

        let findBook = await BookModel.findById(Id);
        if(!findBook) {return res.status(400).send({status:false, msg:"this bookId doen't exist in book collection"})}
        if (!findBook.isDeleted == false) {
            res.status(400).send("This Books Already Deleted")
        }
        let updateBook = await BookModel.findOneAndUpdate({ _id: Id, isDeleted: false }, req.body, { new: true })
        
        res.status(200).send({data:updateBook});


    } catch (error) {
        res.status(500).send({ satus: false, msg: error.message });

    }
};

const deleteBookById = async function (req, res) {
  try {
   let bookId = req.params.bookId
   if(!isValidString(bookId)){
   res.status(400).send({ status : false, msg : "bookId is not valid"})
   return
  }

  const book = await BookModel.findById(bookId);
  if(book.isDeleted == true){
      res.status(400).send({ status : false, msg : "book is already deleted"})
      return
  }
  let deleteBook = await BookModel.findByIdAndUpdate({_id : bookId} ,{ isDeleted : true, deletedAt : new Date()},{ new : true})
  if(isValidString(deleteBook)){
      res.status(200).send({ status : true, msg : " successfully delete content",data:deleteBook})
      return
 }
  }catch(error){
      res.status(500).send({ status: false, msg : error.message})
  }

}



module.exports.CreateBook=CreateBook
module.exports.getBooks=getBooks
module.exports.getreview=getreview
module.exports.updateBook = updateBook
module.exports.deleteBookById = deleteBookById
