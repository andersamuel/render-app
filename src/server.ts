import fastify from "fastify";
import { z } from "zod";

const server = fastify();

const zodSchema = z.object({
  name: z.string().nonempty(),
  age: z.coerce.number(),
});

async function ZodValidation<T>(args: z.SafeParseReturnType<T, T>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!args.success) {
      return reject(args.error.issues[0].message);
    }

    return resolve(args.data);
  });
}

server.get("/", async (request, reply) => {
  return `Server Version ${process.env.npm_package_version}`;
});

server.get("/ping", async (request, reply) => {
  const validation = zodSchema.safeParse(request.query);

  const { name, age } = await ZodValidation(validation).catch((error) => {
    return reply.code(400).send({
      code: 400,
      message: error,
    });
  });

  return { name, age };
});

server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
