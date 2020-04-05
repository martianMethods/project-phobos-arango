const fs = require("fs");
const { PerformanceObserver, performance } = require('perf_hooks');
const faker = require("faker");
const parse = require('csv-parse/lib/sync')
const obs = new PerformanceObserver((items) => {
  console.log(Math.round(items.getEntries()[0].duration/60000)+'m');
  performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });



var qid = 3521634;
var aid = 12392946;
var phid = 3717892;

const question = () => {
  let output = {
    id: ++qid,
    product_id: Math.ceil(Math.random() * 1000011),
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

const input = fs.readFileSync('./answers_photos.csv')
const records = parse(input, {
  columns: true,
  to: 1000
})
records.pop()
records.pop()

const photo = () => {
  let output = {
    id: ++phid,
    answer_id: Math.ceil(Math.random() * 10000000) + 12392946,
    url: records[Math.floor(Math.random()*1000)].url,
  };
  return `${output.id},${output.answer_id},"${output.url}"\n`;
};


performance.mark("A");
// for (let i = 0; i < 10000000; i++) {
  // fs.appendFileSync("./newquestions.csv", question());
  // fs.appendFileSync("./newanswers.csv", answer());
  // fs.appendFileSync("./newphotos2.csv", photo());
// }
performance.mark("B");
performance.measure("A to B", "A", "B");
