"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const decimal_to_number_interceptor_1 = require("./utils/decimal-to-number.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new decimal_to_number_interceptor_1.DecimalToNumberInterceptor());
    await app.listen(3000);
    console.log(`Backend rodando em: http://localhost:3000`);
}
bootstrap();
//# sourceMappingURL=main.js.map