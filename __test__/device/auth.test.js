
const dotenv = require('dotenv');
dotenv.config();
process.env.NODE_ENV = 'test';
const db = require('mongoose');
const request = require('supertest');
const {
  MongoClient, ObjectId 
} = require('mongodb');
const app = require('../../app.js');
const authConstant = require('../../constants/authConstant');
const uri = 'mongodb://127.0.0.1:27017';

const client = new MongoClient(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

let inserted_admin = {};

beforeAll(async function (){
  try {
    await client.connect();
    const db = client.db('momind_test');

    const admin = db.collection('admin');
    inserted_admin = await admin.insertOne({
      fullName: 'Florida',
      email: 'Axel.Jaskolski@hotmail.com',
      password: 'S3ub4CDDro5zPds',
      mobileNo: '330-567-6456 x4114',
      role: 891,
      resetPasswordLink: {},
      loginRetryLimit: 425,
      loginReactiveTime: '2022-07-07T19:34:27.764Z',
      id: '619914561fd2305cb8c1576c'
    });
  }
  catch (err) {
    console.error(`we encountered ${err}`);
  }
  finally {
    client.close();
  }
});

describe('POST /register -> if email and username is given', () => {
  test('should register a admin', async () => {
    let registeredUser = await request(app)
      .post('/device/auth/register')
      .send({
        'fullName':'channels',
        'email':'Darrin2@hotmail.com',
        'password':'ZN0ePTG9aV_hq6r',
        'mobileNo':'996.827.2354',
        'addedBy':inserted_admin.insertedId,
        'updatedBy':inserted_admin.insertedId,
        'role':authConstant.USER_ROLE.User
      });
    expect(registeredUser.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(registeredUser.body.status).toBe('SUCCESS');
    expect(registeredUser.body.data).toMatchObject({ id: expect.any(String) });
    expect(registeredUser.statusCode).toBe(200);
  });
});

describe('POST /login -> if username and password is correct', () => {
  test('should return admin with authentication token', async () => {
    let admin = await request(app)
      .post('/device/auth/login')
      .send(
        {
          username: 'Darrin2@hotmail.com',
          password: 'ZN0ePTG9aV_hq6r'
        }
      );
    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('SUCCESS');
    expect(admin.body.data).toMatchObject({
      id: expect.any(String),
      token: expect.any(String)
    }); 
    expect(admin.statusCode).toBe(200);
  });
});

describe('POST /login -> if username is incorrect', () => {
  test('should return unauthorized status and admin not exists', async () => {
    let admin = await request(app)
      .post('/device/auth/login')
      .send(
        {
          username: 'wrong.username',
          password: 'ZN0ePTG9aV_hq6r'
        }
      );

    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('BAD_REQUEST');
    expect(admin.statusCode).toBe(400);
  });
});

describe('POST /login -> if password is incorrect', () => {
  test('should return unauthorized status and incorrect password', async () => {
    let admin = await request(app)
      .post('/device/auth/login')
      .send(
        {
          username: 'Darrin2@hotmail.com',
          password: 'wrong@password'
        }
      );

    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('BAD_REQUEST');
    expect(admin.statusCode).toBe(400);
  });
});

describe('POST /login -> if username or password is empty string or has not passed in body', () => {
  test('should return bad request status and insufficient parameters', async () => {
    let admin = await request(app)
      .post('/device/auth/login')
      .send({});

    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('BAD_REQUEST');
    expect(admin.body.message).toBe('Insufficient parameters');
    expect(admin.statusCode).toBe(422);
  });
});

describe('POST /forgot-password -> if email has not passed from request body', () => {
  test('should return bad request status and insufficient parameters', async () => {
    let admin = await request(app)
      .post('/device/auth/forgot-password')
      .send({ email: '' });

    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('BAD_REQUEST');
    expect(admin.body.message).toBe('Insufficient parameters');
    expect(admin.statusCode).toBe(422);
  });
});

describe('POST /forgot-password -> if email passed from request body is not available in database ', () => {
  test('should return record not found status', async () => {
    let admin = await request(app)
      .post('/device/auth/forgot-password')
      .send({ 'email': 'unavailable.email@hotmail.com', });

    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('RECORD_NOT_FOUND');
    expect(admin.body.message).toBe('Record not found with specified criteria.');
    expect(admin.statusCode).toBe(200);
  });
});

describe('POST /forgot-password -> if email passed from request body is valid and OTP sent successfully', () => {
  test('should return success message', async () => {
    const expectedOutputMessages = [
      'otp successfully send.',
      'otp successfully send to your email.',
      'otp successfully send to your mobile number.'
    ];
    let admin = await request(app)
      .post('/device/auth/forgot-password')
      .send({ 'email':'Darrin2@hotmail.com', });

    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('SUCCESS');
    expect(expectedOutputMessages).toContain(admin.body.message);
    expect(admin.statusCode).toBe(200);
  });
});

describe('POST /validate-otp -> otp is sent in request body and OTP is correct', () => {
  test('should return success', () => {
    return request(app)
      .post('/device/auth/login')
      .send(
        {
          username: 'Darrin2@hotmail.com',
          password: 'ZN0ePTG9aV_hq6r'
        }).then(login => () => {
        return request(app)
          .get(`/device/api/v1/admin/${login.body.data.id}`)
          .set({
            Accept: 'application/json',
            Authorization: `Bearer ${login.body.data.token}`
          }).then(foundUser => {
            return request(app)
              .post('/device/auth/validate-otp')
              .send({ 'otp': foundUser.body.data.resetPasswordLink.code, }).then(admin => {
                expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
                expect(admin.body.status).toBe('SUCCESS');
                expect(admin.statusCode).toBe(200);
              });
          });
      });
  });
});

describe('POST /validate-otp -> if OTP is incorrect or OTP has expired', () => {
  test('should return invalid OTP', async () => {
    let admin = await request(app)
      .post('/device/auth/validate-otp')
      .send({ 'otp': '12334' });
    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('FAILURE');
    expect(admin.statusCode).toBe(200);
    expect(admin.body.message).toBe('Invalid OTP');
  });
});

describe('POST /validate-otp -> if request body is empty or otp has not been sent in body', () => {
  test('should return insufficient parameter', async () => {
    let admin = await request(app)
      .post('/device/auth/validate-otp')
      .send({});

    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('BAD_REQUEST');
    expect(admin.statusCode).toBe(422);
  });
});

describe('PUT /reset-password -> code is sent in request body and code is correct', () => {
  test('should return success', () => {
    return request(app)
      .post('/device/auth/login')
      .send(
        {
          username: 'Darrin2@hotmail.com',
          password: 'ZN0ePTG9aV_hq6r'
        }).then(login => () => {
        return request(app)
          .get(`/device/api/v1/admin/${login.body.data.id}`)
          .set({
            Accept: 'application/json',
            Authorization: `Bearer ${login.body.data.token}`
          }).then(foundUser => {
            return request(app)
              .put('/device/auth/validate-otp')
              .send({
                'code': foundUser.body.data.resetPasswordLink.code,
                'newPassword':'newPassword'
              }).then(admin => {
                expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
                expect(admin.body.status).toBe('SUCCESS');
                expect(admin.statusCode).toBe(200);
              });
          });
      });
  });
});

describe('PUT /reset-password -> if request body is empty or code/newPassword is not given', () => {
  test('should return insufficient parameter', async () => {
    let admin = await request(app)
      .put('/device/auth/reset-password')
      .send({});

    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('BAD_REQUEST');
    expect(admin.statusCode).toBe(422);
  });
});

describe('PUT /reset-password -> if code is invalid', () => {
  test('should return invalid code', async () => {
    let admin = await request(app)
      .put('/device/auth/reset-password')
      .send({
        'code': '123',
        'newPassword': 'testPassword'
      });

    expect(admin.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(admin.body.status).toBe('FAILURE');
    expect(admin.body.message).toBe('Invalid Code');
    expect(admin.statusCode).toBe(200);
  });
});

afterAll(function (done) {
  db.connection.db.dropDatabase(function () {
    db.connection.close(function () {
      done();
    });
  });
});
