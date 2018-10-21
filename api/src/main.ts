import * as cors from 'cors';
import * as morgan from 'morgan';
import * as expressHandlebars from 'express-handlebars';
import {NestFactory} from '@nestjs/core';
import {ApplicationModule} from './app.module';
import {INestApplication} from '@nestjs/common';

async function bootstrap() {
    const app: INestApplication = await NestFactory.create(ApplicationModule);

    app.use(cors({
        allowedHeaders: ['content-type'],
    }));

    app.use(morgan('dev', {
        skip: (req, res) => {
            return res.statusCode < 400;
        },
        stream: process.stderr,
    }));

    app.use(morgan('dev', {
        skip: (req, res) => {
            return res.statusCode >= 400;
        },
        stream: process.stdout,
    }));

    app.set('view engine', 'handlebars');
    app.engine('handlebars', expressHandlebars({
        defaultLayout: 'main',
        layoutsDir: __dirname + '/views/layouts',
    }));
    app.set('views', __dirname + '/views');

    // TODO Get port from config. How to get config here?
    await app.listen(3000);
}

bootstrap();
