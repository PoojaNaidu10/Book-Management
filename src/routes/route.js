const express = require('express');
const router = express.Router();
const UserController = require("../controller/UserController")
const BookController =require("../controller/BookController")
const ReviewController =require("../controller/ReviewController")
const Middleware =require("../Middleware/auth")

router.post("/register",UserController.CreateUser)

router.post("/login",UserController.UserLogin)

router.post("/books",Middleware.authenticate,BookController.CreateBook)

router.get("/books",Middleware.authenticate,BookController.getBooks)

router.get("/books/:bookId",Middleware.authenticate,BookController.getreview)

router.put("/book/:bookId",Middleware.authenticate,Middleware.authorisation,BookController.updateBook)

router.delete("/books/:bookId",Middleware.authenticate,Middleware.authorisation,BookController.deleteBookById)

router.post("/books/:bookId/review",ReviewController.createReview)

router.put("/books/:bookId/review/:reviewId",ReviewController.updateReview)

router.delete("/books/:bookId/review/:reviewId",ReviewController.deletereview)

module.exports = router;