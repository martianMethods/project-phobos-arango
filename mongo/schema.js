var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
  product_id: Number,
  questions: [{
    question_id: Number,
    question_body: String,
    question_date_written: Date,
    question_asker_name: String,
    question_asker_email: String,
    question_reported: Number,
    question_helpful: Number,
    answers: [{
      answer_id: Number,
      answer_body: String,
      answer_date_written: Date,
      answer_name: String,
      answer_email: String,
      answer_helpful: Number,
      answer_reported: Number,
      photos:[{
        answer_photos_id: Number,
        answer_photos_url: String
      }]
    }]
  }]
});
