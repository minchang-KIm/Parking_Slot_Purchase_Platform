const request = require('supertest');
const app = require('../src/app');

describe('Parking Space API Tests', () => {
  let token;
  let parkingSpaceId;

  beforeAll(async () => {
    // 테스트용 사용자 로그인
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'provider@example.com',
        password: 'password123'
      });

    token = res.body.data.token;
  });

  describe('POST /api/parking-spaces', () => {
    it('should create a new parking space', async () => {
      const res = await request(app)
        .post('/api/parking-spaces')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '테스트 주차공간',
          description: '테스트용 주차공간입니다',
          address: '서울특별시 강남구',
          location: {
            type: 'Point',
            coordinates: [126.9780, 37.5665]
          },
          price: {
            hourly: 5000
          },
          spaceType: 'indoor'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      parkingSpaceId = res.body.data._id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/parking-spaces')
        .send({
          title: '테스트 주차공간',
          address: '서울특별시'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/parking-spaces', () => {
    it('should get all parking spaces', async () => {
      const res = await request(app)
        .get('/api/parking-spaces');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter by location', async () => {
      const res = await request(app)
        .get('/api/parking-spaces')
        .query({
          lat: 37.5665,
          lng: 126.9780,
          radius: 5000
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/parking-spaces/:id', () => {
    it('should get a parking space by id', async () => {
      const res = await request(app)
        .get(`/api/parking-spaces/${parkingSpaceId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('title');
    });
  });
});
