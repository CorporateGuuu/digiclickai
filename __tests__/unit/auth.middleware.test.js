const jwt = require('jsonwebtoken');
const { isAuthenticated, isAdmin, JWT_SECRET } = require('../../middleware/auth');

// Mock the PostgreSQL pool
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mockPool) };
});

// Mock request and response objects
const mockRequest = () => {
  const req = {};
  req.session = {};
  req.cookies = {};
  req.headers = {};
  return req;
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
  });
  
  describe('isAuthenticated', () => {
    test('should call next() if user is authenticated via session', () => {
      req.session.userId = 1;
      
      isAuthenticated(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
    
    test('should call next() if user is authenticated via JWT token', () => {
      const token = jwt.sign({ id: 1 }, JWT_SECRET);
      req.cookies.token = token;
      
      isAuthenticated(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(1);
    });
    
    test('should redirect to login if no authentication is provided', () => {
      isAuthenticated(req, res, next);
      
      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(next).not.toHaveBeenCalled();
    });
    
    test('should redirect to login if JWT token is invalid', () => {
      req.cookies.token = 'invalid-token';
      
      isAuthenticated(req, res, next);
      
      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(next).not.toHaveBeenCalled();
    });
  });
});
