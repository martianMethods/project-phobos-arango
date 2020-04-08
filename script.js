import http from 'k6/http';
import { sleep } from 'k6';

export let options ={
  duration: '10s',
  vus: 1000
}

export default function() {
  http.get(`http://localhost:3000/qa/${Math.ceil(Math.random()*1000000)}`);
  sleep(1);
}