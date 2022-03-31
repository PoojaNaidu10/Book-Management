const jwt = require("jsonwebtoken");
const BookModel =require("../Model/BookModel")

let authenticate = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token) {
            return res.status(404).send({ msg: "Token must be Present" })
        }
        next()
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}

let authorisation = async function (req, res, next) {
    try {
      let bookId = req.params.bookId;
      if (!bookId) {
        return res
          .status(400)
          .send({ status: false, msg: "bookId is required for authorisation" });
      }
      let token = req.headers["x-api-key"];
      let decodetoken = jwt.verify(token, "secret-key");
      if (!decodetoken) {
        return res
          .status(401)
          .send({ status: false, msg: "you are not authenticated" });
      }
      let bookid = await BookModel.findById(bookId);
  
      let BooktobeModified = bookid.userId;
      let userloggedin = decodetoken.userId;
      if (BooktobeModified != userloggedin) {
        return res
          .status(403)
          .send({ status: false, msg: "you are not authorised" });
        
      }
      next()
    } catch (err) {
      return res.status(500).send({ status: false, error: err.message });
    }
  };



module.exports.authenticate=authenticate
module.exports.authorisation=authorisation
