import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

export let errorRate = new Rate("errors");

export let options = {
  vus: 60,
  thresholds: {
    http_req_duration: ["max<2000"],
  },
  duration: "20s",
  throw: true,
};

export default function () {
  var url = `http://54.191.110.4:4000/qa/${Math.ceil(Math.random() * 1000000)}`;
  for (let i = 0; i < 120; i++) {
    check(http.get(url), {
      "status is 200": (r) => r.status == 200,
    }) || errorRate.add(1);
    sleep(0.01);
  }
}
