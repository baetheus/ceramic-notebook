import * as R from "pick/router";
import { createLogRouter } from "pick/logger";
import { pipe } from "fun/fn";
import { metrics, trace } from "@opentelemetry/api";

import { spaBuild, spaRouter } from "~/client/serve.ts";
import { apiRouter } from "~/server/serve.ts";

const tracer = trace.getTracer("ceramic-notebook", "1.0.0");
const meter = metrics.getMeter("ceramic-notebook", "1.0.0");

function joinRouter<S>(
  second: R.Router<S>,
): <T>(first: R.Router<T>) => R.Router<S & T> {
  return (first) => [...first, ...second];
}

const env = Deno.env.toObject();
for (const key in env) {
  if (key.startsWith("OTEL")) {
    console.log(key, env[key]);
  }
}

tracer.startActiveSpan("client_build", async (span) => {
  const start = performance.now();
  span.addEvent("client_build_started");
  await spaBuild(true);
  span.addEvent("client_build_completed");
  const duration = performance.now() - start;
  span.setAttribute("startup.build_client_duration", duration);
});

const handler = pipe(
  R.router(),
  joinRouter(apiRouter),
  joinRouter(spaRouter),
  createLogRouter(),
  R.withState(null),
);

const server = Deno.serve(handler);
console.log(`Server started on port ${server.addr.port}`);
