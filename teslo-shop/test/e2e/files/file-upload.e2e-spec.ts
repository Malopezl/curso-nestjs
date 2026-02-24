import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';

describe('Files Module (e2e)', () => {
  let app: INestApplication;

  const testImagePath = join(__dirname, 'test-image.jpg');

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should throw a 400 error if no file is uploaded', async () => {
    const response = await request(app.getHttpServer()).post('/files/product');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Make sure that the file is an image',
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should throw a 400 error if the file is not an image', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/product')
      .attach('file', Buffer.from('This is not an image'), 'test.txt');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Make sure that the file is an image',
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('should upload a valid image file', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/product')
      .attach('file', testImagePath);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('secureUrl');
    expect(response.body).toHaveProperty('fileName');
    expect(response.body.secureUrl).toContain('/files/product/');

    const filePath = join(
      __dirname,
      '../../../static/products',
      response.body.fileName,
    );
    const fileExists = existsSync(filePath);

    expect(fileExists).toBe(true);
    unlinkSync(filePath); // Clean up the uploaded file after the test
  });

  it('should throw a 400 error if the requested image does not exist', async () => {
    const response = await request(app.getHttpServer()).get(
      '/files/product/nonexistent.jpg',
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'No product found with image nonexistent.jpg',
      error: 'Bad Request',
      statusCode: 400,
    });
  });
});
