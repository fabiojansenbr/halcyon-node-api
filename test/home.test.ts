import request from 'supertest';
import app from '../src/app';

describe('GET /', () => {
    it('should redirect to /swagger', () => {
        return request(app)
            .get('/')
            .expect(301)
            .expect('Location', '/swagger/');
    });
});

describe('GET /swagger', () => {
    it('should return 200 OK', () => {
        return request(app)
            .get('/swagger/')
            .expect(200);
    });
});
