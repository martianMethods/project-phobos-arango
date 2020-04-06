const express = require('express')
const bodyParser = require("body-parser");
const app = express()

app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, "../client/public")));


app.get('/qa/:product_id');
app.get('/qa/:question_id/answers')
app.post('/qa/:product_id');
app.post('/qa/:question_id/answers')
app.put('/qa/question/:question_id/helpful')
app.put('/qa/question/:question_id/report')
app.put('/qa/answer/:answer_id/helpful')
app.put('/qa/answer/:answer_id/report')

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Web server running on: http://localhost:${PORT}`);
});
