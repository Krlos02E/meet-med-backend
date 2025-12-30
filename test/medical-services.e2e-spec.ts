import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import * as cookieParser from 'cookie-parser';
import { UserRole } from './../src/modules/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

describe('MedicalServicesController (e2e)', () => {
  let app: INestApplication;
  let adminCookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const configService = app.get(ConfigService);
    app.use(cookieParser(configService.get('COOKIE_SECRET')));
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Create and login as admin
    const adminEmail = `admin-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, password: 'password123', role: UserRole.ADMIN });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: 'password123' });

    adminCookie = loginRes.header['set-cookie'][0].split(';')[0];
  });

  afterAll(async () => {
    await app.close();
  });

  it('/medical-services (POST) - ADMIN', async () => {
    const serviceData = {
      name: 'Cardiology Checkup',
      description: 'Heart health assessment',
      price: 150.0,
      availabilities: [
        { dateTime: '2025-12-12T14:30:00Z' },
        { dateTime: '2025-12-12T16:30:00Z' },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/medical-services')
      .set('Cookie', [adminCookie])
      .send(serviceData)
      .expect(201);

    expect(response.body.name).toBe(serviceData.name);
    expect(response.body.availabilities).toHaveLength(2);
  });

  it('/medical-services (GET) - Search and Pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/medical-services?page=1&limit=5')
      .set('Cookie', [adminCookie])
      .expect(200);

    expect(response.body.items).toBeDefined();
    expect(response.body.meta.page).toBe(1);
  });
});
