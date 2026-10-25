import 'reflect-metadata';
import {
  Controller,
  Get,
  MiddlewareConsumer,
  Module,
  Req,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

type CountedRequest = { runs?: number };

@Controller({ path: 'items', version: '1' })
class ItemsV1Controller {
  @Get()
  list(@Req() req: CountedRequest) {
    return { handler: 'v1', runs: req.runs ?? 0 };
  }
}

@Controller({ path: 'items', version: '2' })
class ItemsV2Controller {
  @Get()
  list(@Req() req: CountedRequest) {
    return { handler: 'v2', runs: req.runs ?? 0 };
  }
}

@Controller({ path: 'orders', version: ['1', '2'] })
class OrdersController {
  @Get()
  list(@Req() req: CountedRequest) {
    return { handler: 'orders', runs: req.runs ?? 0 };
  }
}

@Module({
  controllers: [ItemsV1Controller, ItemsV2Controller, OrdersController],
})
class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: CountedRequest, _res: unknown, next: () => void) => {
        req.runs = (req.runs ?? 0) + 1;
        next();
      })
      .forRoutes(ItemsV1Controller, OrdersController);
  }
}

const app = await NestFactory.create(AppModule, { logger: false });
app.enableVersioning({ type: VersioningType.HEADER, header: 'x-api-version' });
await app.listen(0, '127.0.0.1');
const url = await app.getUrl();

for (const [path, version] of [
  ['items', '1'],
  ['items', '2'],
  ['orders', '1'],
  ['orders', '2'],
]) {
  const res = await fetch(`${url}/${path}`, {
    headers: { 'x-api-version': version },
  });
  console.log(`GET /${path} (x-api-version: ${version}) -> ${await res.text()}`);
}
await app.close();
