const fs = require("fs");
const { PerformanceObserver, performance } = require('perf_hooks');
const faker = require("faker");
const parse = require('csv-parse/lib/sync')
const stringify = require('csv-stringify')
const obs = new PerformanceObserver((items) => {
  console.log(Math.round(items.getEntries()[0].duration/60000)+'m');
  performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });


// 260564 product ids
var qid = 3521634; // 3521634 question, fewer ids
var aid = 12392946;
var phid = 3717892;

const question = () => {
  let output = {
    id: ++qid,
    product_id: Math.ceil(Math.random() * 260564),
    body: faker.lorem.sentence().slice(0, -1) + "?",
    date_written: faker.date.past(5).toJSON().slice(0, 10),
    asker_name: faker.name.firstName(),
    asker_email: faker.internet.email(),
    reported: Math.random() > 0.8 ? 1 : 0,
    helpful: Math.floor(Math.random() * 25),
  };
  return `${output.id},${output.product_id},"${output.body}","${output.date_written}","${output.asker_name}","${output.asker_email}",${output.reported},${output.helpful}\n`;
};

const answer = () => {
  let output = {
    id: ++aid,
    question_id: Math.ceil(Math.random() * 10000000) + 3521634,
    body: faker.lorem.sentence(),
    date_written: faker.date.past(5).toJSON().slice(0, 10),
    answerer_name: faker.name.firstName(),
    answerer_email: faker.internet.email(),
    reported: Math.random() > 0.8 ? 1 : 0,
    helpful: Math.floor(Math.random() * 25),
  };
  return `${output.id},${output.question_id},"${output.body}","${output.date_written}","${output.answerer_name}","${output.answerer_email}",${output.reported},${output.helpful}\n`;
};

const input = fs.readFileSync('./photo_urls.csv')
const records = parse(input, {
  skip_empty_lines:true
})

const photo = () => {
  let output = {
    id: ++phid,
    answer_id: Math.ceil(Math.random() * 10000000) + 12392946,
    url: records[Math.floor(Math.random()*records.length-1)+1][0],
  };
  return `${output.id},${output.answer_id},"${output.url}"\n`;
};


performance.mark("A");
var wstream = fs.createWriteStream("./newquestions.csv")
wstream.write('id,product_id,body,date_written,asker_name,asker_email,reported,helpful\n')
for (let i = 0; i < 10000000; i++) {
  wstream.write(question());
  // fs.appendFileSync("./newanswers.csv", answer());
  // fs.appendFileSync("./newphotos.csv", photo());
}
wstream.end()
performance.mark("B");
performance.measure("A to B", "A", "B");