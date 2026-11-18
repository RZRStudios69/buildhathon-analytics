/**
 *
 * Please update this so that we can track the latest version.
 *
 * Author           : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Contributor : RZRStudios69 (rzrstudios69[at]gmail.com)
 * Last Updated     : 18 Nov 2026
 *
 * **/

import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from 'app.module';
import { AppCode } from 'app/core/types/app.types';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';

async function bootstrap() {

    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const SERVER_ADDRESS = process.env.SERVER_ADDRESS || '127.0.0.1';
    const SERVER_PORT = process.env.SERVER_PORT || 3000;

    /**
     * Set Global Prefix
     */
    if (process.env.SERVER_CONTEXT) {
        app.setGlobalPrefix(process.env.SERVER_CONTEXT);
    }

    /**
     * Enable CORS for the configured origins only
     */
    const corsOrigins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((corsOrigin) => corsOrigin.trim())
        .filter(Boolean);
    app.enableCors({ origin: corsOrigins.length > 0 ? corsOrigins : false });

    /**
     * Enables automatic transformation of input values and ensures only valid properties are passed to the DTO.
     * A failed DTO answers with the house envelope, naming the first broken constraint.
     */
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            exceptionFactory: (validationErrors: ValidationError[]) => {
                const failedCode = AppCode.INVALID_REQUEST;
                return new DefaultHttpException({
                    message: getFirstConstraintMessage(validationErrors[0]),
                    code: failedCode.code,
                    statusCode: failedCode.status,
                });
            },
        }),
    );

    /**
     * Disable Debugging: keep errors, warnings and logs, drop debug and verbose
     */
    if (process.env.ENABLE_DEBUGGING !== 'true') {
        app.useLogger(['error', 'warn', 'log']);
    }

    /**
     * Run onModuleDestroy (close the Postgres pool) on SIGTERM
     */
    app.enableShutdownHooks();

    /**
     * Swagger
     */
    if (process.env.SWAGGER_ENABLED === 'true') {
        const config = new DocumentBuilder()
            .setTitle(process.env.SWAGGER_TITLE)
            .setDescription(process.env.SWAGGER_DESCRIPTION)
            .setVersion(process.env.SWAGGER_VERSION)
            .build();

        const document = SwaggerModule.createDocument(app, config);
        const context = process.env.SERVER_CONTEXT ? process.env.SERVER_CONTEXT + '/swagger' : 'swagger';
        SwaggerModule.setup(context, app, document);
        Logger.log(`Swagger configured on http://localhost:${SERVER_PORT}/${context}`, 'MainApplication');
    }

    await app.listen(SERVER_PORT, SERVER_ADDRESS);
    Logger.log(`NestJS app is running on http://${SERVER_ADDRESS}:${SERVER_PORT}`, 'MainApplication');
}

function getFirstConstraintMessage(validationError: ValidationError): string {
    if (validationError?.children?.length) {
        return getFirstConstraintMessage(validationError.children[0]);
    }

    const constraints = validationError?.constraints ?? {};
    return constraints[Object.keys(constraints)[0]] ?? 'Validation error';
}

bootstrap().catch((error) => {
    Logger.error(`Application failed to start: ${error?.message ?? error}`, 'MainApplication');
    process.exit(1);
});
