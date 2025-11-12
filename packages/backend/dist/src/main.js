"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });
    app.setGlobalPrefix('api');
    await app.init();
    return app;
}
let cachedApp;
exports.default = async (req, res) => {
    if (!cachedApp) {
        cachedApp = await bootstrap();
    }
    const httpAdapter = cachedApp.getHttpAdapter();
    httpAdapter.getInstance()(req, res);
};
//# sourceMappingURL=main.js.map