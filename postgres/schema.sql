CREATE DATABASE qa;
\c qa;
CREATE TABLE products(
  id INT PRIMARY KEY NOT NULL
);
CREATE TABLE questions(
  id INT PRIMARY KEY NOT NULL,
  product_id INT REFERENCES products(id),
  body TEXT,
  date_written DATE,
  asker_name TEXT,
  asker_email TEXT,
  reported INT,
  helpful INT
);
CREATE TABLE answers(
  id INT PRIMARY KEY NOT NULL,
  question_id INT REFERENCES questions(id),
  body TEXT,
  date_written DATE,
  answer_name TEXT,
  answer_email TEXT,
  reported INT,
  helpful INT
);
CREATE TABLE answers_photos(
  id INT PRIMARY KEY NOT NULL,
  answers_id INT REFERENCES answers(id),
  url TEXT
);