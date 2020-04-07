const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var arangojs = require("arangojs");
var aql = arangojs.aql;
var db = new arangojs.Database({
  url: "http://localhost:8529",
});
var arangoAuth = require("./arangoAuth.js");
db.useBasicAuth(arangoAuth.user, arangoAuth.password);
app.use(bodyParser.json());

// app.use(express.static(path.join(__dirname, "../client/public")));

app.get("/qa/:product_id/", (req, res) => {
  db.query(
    aql`for q in questions
  filter q.product_id == ${Number(req.params.product_id)}
  limit ${Number(req.query.count) || 5}
  return merge(q,{answers:merge(
    for a in answers
    filter to_number(q._key) == a.question_id
    return {[a._key]:merge(a,{photos:
      (for p in answers_photos
      filter to_number(a._key) == p.answer_id
      return p)
    })}
  )})`
  )
    .then((result) => {
      let output = result._result.map((each) => {
        let temp = {
          question_id: Number(each._key),
          question_body: each.body,
          question_date: each.date_written + "T00:00:00.000Z",
          asker_name: each.asker_name,
          question_helpfulness: each.helpful,
          reported: each.reported,
          answers: each.answers,
        };
        for (key in temp.answers) {
          temp.answers[key] = {
            id: Number(temp.answers[key]._key),
            body: temp.answers[key].body,
            date: temp.answers[key].date_written,
            answerer_name: temp.answers[key].answerer_name,
            helpfulness: temp.answers[key].helpful,
            photos: temp.answers[key].photos.map((photo) => ({
              id: Number(photo._key),
              url: photo.url,
            })),
          };
        }
        return temp;
      });
      res.send({ product_id: req.params.product_id, results: output });
    })
    .catch((error) => console.error(error));
});

app.get("/qa/:question_id/answers/", (req, res) => {
  db.query(
    aql`
    for a in answers
    filter ${Number(req.params.question_id)} == a.question_id
    limit ${Number(req.query.count) || 5}
    return merge(a,{photos:
      (for p in answers_photos
      filter to_number(a._key) == p.answer_id
      return p
      )
    })`
  )
    .then((result) => {
      
      res.send({ question: req.params.question_id, results: result._result });
    })
    .catch((error) => console.error(error));
});

app.post("/qa/:product_id");

app.post("/qa/:question_id/answers");

app.put("/qa/question/:question_id/helpful");

app.put("/qa/question/:question_id/report");

app.put("/qa/answer/:answer_id/helpful");

app.put("/qa/answer/:answer_id/report");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web server running on: http://localhost:${PORT}`);
});
