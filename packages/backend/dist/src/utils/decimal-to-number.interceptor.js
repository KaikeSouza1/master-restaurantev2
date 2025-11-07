"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecimalToNumberInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const library_1 = require("@prisma/client/runtime/library");
function transformDecimals(value) {
    if (value instanceof library_1.Decimal) {
        return value.toNumber();
    }
    if (Array.isArray(value)) {
        return value.map(transformDecimals);
    }
    if (value !== null && typeof value === 'object') {
        const newObject = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                newObject[key] = transformDecimals(value[key]);
            }
        }
        return newObject;
    }
    return value;
}
let DecimalToNumberInterceptor = class DecimalToNumberInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.map)(data => transformDecimals(data)));
    }
};
exports.DecimalToNumberInterceptor = DecimalToNumberInterceptor;
exports.DecimalToNumberInterceptor = DecimalToNumberInterceptor = __decorate([
    (0, common_1.Injectable)()
], DecimalToNumberInterceptor);
//# sourceMappingURL=decimal-to-number.interceptor.js.map