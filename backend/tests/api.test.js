const request = require('supertest');
const app = require('../src/server');

describe('API Health Check', () => {
  it('should return OK status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message');
  });
});

describe('Authentication', () => {
  it('should require valid credentials for protected routes', async () => {
    const response = await request(app)
      .get('/api/playlists')
      .expect(401);
    
    expect(response.body).toHaveProperty('error');
  });
});
