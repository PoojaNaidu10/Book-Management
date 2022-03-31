const ReviewModel = require("../Model/ReviewModel");
const { isValidObjectId } = require("mongoose")
const BookModel = require("../Model/BookModel")

const isValid = function (value) {
  if (typeof value == undefined || value == null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isBodyRequestValid = function (requestBody) {
    return Object.keys(requestBody).length > 0
  }

  const isValidString = function(value){
    if(typeof value === 'string' && value.trim().length === 0) return false;
    return true;
  }

  function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
  }

  const isvalidNumber = function (value) {
    if (typeof value === "number") {
      return true;
    }
}

  let createReview=async function(req,res){
    
    try{ let data=req.body 
     if(!isBodyRequestValid(data)){return res.status(400).send({status:false,msg:"invalid data"})}
     const {reviewedBy,reviewedAt,rating,review,bookId}=data
     let bookid=req.params.bookId
     if(!isValid(bookid)){return res.status(400).send({status:false,msg:"please enter bookId"})}
     if(!isValidObjectId(bookid)){return res.status(400).send({status:false,msg:"invalid bookId"})}
     let checkId=await BookModel.findById(bookid)
     
     if(!checkId){return res.status(400).send({status:false,msg:"book with this id not found"})}
     if(checkId.isDeleted==true){return res.status(404).send({status:true,msg:"Deleted book"})}
     if(!isValid(bookId)){return res.status(400).send({status:false,msg:"please give bookid in body"})}
     if(bookid!=data.bookId){return res.status(400).send({status:false,msg:"pathparam bookid and body bookid is diffrent"})}
     
 
 
     if(!isValid(reviewedAt)){return res.status(400).send({status:false,msg:"please enter reviewed time"})}
     if(!isValidDate(reviewedAt)){return res.status(400).send({status:false,msg:"please provide date in YYYY-MM-DD format"})}
     if(!isvalidNumber(rating)){return res.status(400).send({status:false,msg:"please give valid rating"})}
     
     if (!([1, 2, 3, 4, 5].includes(Number(rating)))) {
        res.status(400).send({ status: false, msg: "Rating should be from [1,2,3,4,5] this values" })
        return
       }
    
     let saveReview= await ReviewModel.create(data)
     let reviewcount=0
 
     let getdata=await ReviewModel.find().select({review:1,rating:1,reviewedBy:1,isDeleted:1})
     
     
     for(let i=0;i<getdata.length;i++){
         
         
         if(getdata[i].isDeleted!==true){
      reviewcount++
     }}
      getdata.unshift({reviewcount:reviewcount})
     
     res.status(201).send({status:true,data:getdata})}
     catch(err){res.status(500).send({status:false,error:err.message})}
 }




const updateReview = async function(req,res){
    try{
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let requestBody = req.body

        let book = await BookModel.findOne({ _id : bookId, isDeleted : false})
       if (!book){
            res.status(400).send({status : false,msg : "book is not available and book can't update"})
            return
        }
        let review1 = await ReviewModel.findOne({ _id : reviewId,isDeleted: false})
        if(!review1){
            res.status(400).send({ status: false,msg : "review is not available and review can't update"})
            return
        }
        console.log(review1)
        if(!(review1._id==reviewId && review1.bookId==bookId)){return res.status(400).send({status:false,msg:"bookid and reviewid are of diffrent review document"})}
        if(!isBodyRequestValid(requestBody)){
            res.status(400).send({status:false, msg: "please fill vaild detail"})
            return
        }
        let {reviewedBy,rating,review } = requestBody

        if(!isValidString(reviewedBy)){
            res.status(400).send({ status: false, msg: "reviewdBy is required"})
            return
        }
        if(!isValidString(review)){
            res.status(400).send({ status: false, msg: "review is required"})
            return
        }
       if(rating){
        if (!([1, 2, 3, 4, 5].includes(Number(rating)))) {
            res.status(400).send({ status: false, msg: "Rating should be from [1,2,3,4,5] this values" })
            return
           }}
        
        
        let updatedReview = await ReviewModel.findByIdAndUpdate({ _id : reviewId, isDeleted : false}, req.body,{new : true} )
        res.send(updatedReview)
} catch(err){
    res.status(500).send({ status: false, msg : err.message});
}
}

let deletereview = async function (req, res) {
    try {
      let bookId = req.params.bookId;
      let reviewId = req.params.reviewId;
  
      if (!isValidObjectId(bookId)) {
        res.status(400).send({ status: false, msg: "bookId is not valid" });
        return;
      }
  
      if (!isValidObjectId(reviewId)) {
        res.status(400).send({ status: false, msg: "reviewId is not valid" });
        return;
      }
  
      const review = await ReviewModel.findById(reviewId);
      let checkbookId = await BookModel.findById(bookId);
      if (!checkbookId) {
        return res
          .status(404)
          .send({ status: false, msg: "Book with this Id not found" });
      }
      let checkreviewId = await ReviewModel.findById(reviewId);
      if (!checkreviewId) {
        return res
          .status(404)
          .send({ status: false, msg: "review with this Id not found" });
      }
      console.log(checkreviewId);
      if (review.isDeleted == true) {
        res.status(400).send({ status: false, msg: "review is already deleted" });
        return;
      }
      console.log(checkreviewId);
      if (!(checkreviewId._id == reviewId && checkreviewId.bookId == bookId)) {
        return res
          .status(400)
          .send({
            status: false,
            msg: "bookid and reviewid are of diffrent object",
          });
      }
      let deleteReview = await ReviewModel.findByIdAndUpdate(
        { _id: reviewId },
        { isDeleted: true },
        { new: true }
      );
      if (isValid(deleteReview)) {
        res
          .status(200)
          .send({
            status: true,
            msg: " successfully delete content",
            data: deleteReview,
          });
        return;
      }
    } catch (error) {
      return res.status(500).send({ status: false, msg: "server error" });
    }
  };

module.exports.updateReview=updateReview

module.exports.createReview = createReview;

module.exports.deletereview=deletereview
