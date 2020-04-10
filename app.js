require("newrelic");
const cluster = require("cluster");
const express = require("express");
const bodyParser = require("body-parser");
const arangojs = require("arangojs");
const arangoAuth = require("./arangoAuth.js");
const numCPUs = require("os").cpus().length;
const aql = arangojs.aql;
const cors = require("cors");

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  const db = new arangojs.Database({
    url: "http://localhost:8529",
  });

  db.useBasicAuth(arangoAuth.user, arangoAuth.password);
  app.use(bodyParser.json());
  app.use(cors());

  // app.use(express.static(path.join(__dirname, "../client/public")));

  app.get("/qa/:product_id/", (req, res) => {
    let count = Number(req.query.count) || 5;
    let page = Number(req.query.page) || 1;
    db.query(
      aql`for q in questions
  filter q.product_id == ${Number(req.params.product_id)} && q.reported == 0
  limit ${(page - 1) * count}, ${count}
  return merge(q,{answers:merge(
    for a in answers
    filter to_number(q._key) == a.question_id && a.reported == 0
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
              photos: temp.answers[key].photos.map((photo) => photo.url),
            };
          }
          return temp;
        });
        res.send({
          product_id: req.params.product_id,
          page: page,
          count: count,
          results: output,
        });
      })
      .catch((error) => {
        console.error(error);
        res.sendStatus(400);
      });
  });

  app.get("/qa/:question_id/answers/", (req, res) => {
    let count = Number(req.query.count) || 5;
    let page = Number(req.query.page) || 1;
    db.query(
      aql`
    for a in answers
    filter ${Number(req.params.question_id)} == a.question_id && a.reported == 0
    limit ${(page - 1) * count}, ${count}
    return merge(a,{photos:
      (for p in answers_photos
      filter to_number(a._key) == p.answer_id
      return p
      )
    })`
    )
      .then((result) => {
        let output = result._result.map((answer) => {
          return {
            answer_id: Number(answer._key),
            body: answer.body,
            date: answer.date_written,
            answerer_name: answer.answerer_name,
            helpfulness: answer.helpful,
            photos: answer.photos.map((photo) => {
              return {
                id: Number(photo._key),
                url: photo.url,
              };
            }),
          };
        });
        res.send({
          question: req.params.question_id,
          page: page,
          count: count,
          results: output,
        });
      })
      .catch((error) => {
        console.error(error);
        res.sendStatus(400);
      });
  });

  app.post("/qa/:product_id", (req, res) => {
    db.query(
      aql`
  insert {
    product_id:${Number(req.params.product_id)}, 
    body:${req.body.body},
    date_written: ${new Date().toISOString().slice(0, -14)},
    asker_name:${req.body.name}, 
    asker_email:${req.body.email}, 
    reported: 0, 
    helpful: 0
  } into questions
`
    )
      .then(() => res.sendStatus(201))
      .catch((error) => {
        console.error(error);
        res.sendStatus(400);
      });
  });

  app.post("/qa/:question_id/answers", (req, res) => {
    db.query(
      aql`
  insert {
    question_id:${Number(req.params.question_id)}, 
    body:${req.body.body},
    date_written: ${new Date().toISOString().slice(0, -14)},
    answerer_name:${req.body.name}, 
    answerer_email:${req.body.email}, 
    reported: 0, 
    helpful: 0
  } into answers
  let inserted = NEW
  let photos = ${req.body.photos}
  for p in photos
  insert {answer_id:to_number(inserted._key),url:p} into answers_photos
  `
    )
      .then(() => res.sendStatus(201))
      .catch((error) => {
        console.error(error);
        res.sendStatus(400);
      });
  });

  app.put("/qa/question/:question_id/helpful", (req, res) => {
    db.query(
      aql`
    for q in questions
    filter q._key == to_string(${req.params.question_id})
    update q with {helpful: q.helpful +1} in questions
  `
    )
      .then(() => res.sendStatus(204))
      .catch((error) => {
        console.error(error);
        res.sendStatus(400);
      });
  });

  app.put("/qa/question/:question_id/report", (req, res) => {
    db.query(
      aql`
    for q in questions
    filter q._key == to_string(${req.params.question_id})
    update q with {reported: q.reported +1} in questions
  `
    )
      .then(() => res.sendStatus(204))
      .catch((error) => {
        console.error(error);
        res.sendStatus(400);
      });
  });

  app.put("/qa/answer/:answer_id/helpful", (req, res) => {
    db.query(
      aql`
    for a in answers
    filter a._key == to_string(${req.params.answer_id})
    update a with {helpful: a.helpful +1} in answers
  `
    )
      .then(() => res.sendStatus(204))
      .catch((error) => {
        console.error(error);
        res.sendStatus(400);
      });
  });

  app.put("/qa/answer/:answer_id/report", (req, res) => {
    db.query(
      aql`
    for a in answers
    filter a._key == to_string(${req.params.answer_id})
    update a with {reported: a.reported +1} in answers
  `
    )
      .then(() => res.sendStatus(204))
      .catch((error) => {
        console.error(error);
        res.sendStatus(400);
      });
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Web server running on: http://localhost:${PORT}`);
  });

  console.log(`Worker ${process.pid} started`);
}
