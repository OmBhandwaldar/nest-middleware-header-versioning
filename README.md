# Middleware bound to a versioned route runs for every version (header versioning)

Minimal reproduction for NestJS: header versioning, two controllers for `/items` (versions `1` and `2`)
and one controller for `/orders` with versions `['1', '2']`. A middleware that counts its runs is bound
with `forRoutes(ItemsV1Controller, OrdersController)`.

Tested with `@nestjs/core` 12.2.0 (also 10.4.15 and 11.1.6), Node.js 24.16.0, macOS. Media type and
custom versioning behave the same, on Express and Fastify.

```sh
npm install
npm start
```

Output:

```
GET /items (x-api-version: 1) -> {"handler":"v1","runs":1}
GET /items (x-api-version: 2) -> {"handler":"v2","runs":1}
GET /orders (x-api-version: 1) -> {"handler":"orders","runs":2}
GET /orders (x-api-version: 2) -> {"handler":"orders","runs":2}
```

Expected: `runs` is `0` for `/items` version 2 (served by `ItemsV2Controller`) and `1` for `/orders`.
