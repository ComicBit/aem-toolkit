const { getHostAndPort, urlsMatch } = require('../content');

describe('getHostAndPort', () => {
  test('parses hostname and port', () => {
    expect(getHostAndPort('http://example.com:4502', '')).toEqual({ hostname: 'example.com', port: '4502' });
  });

  test('handles url without port', () => {
    expect(getHostAndPort('http://example.com', '')).toEqual({ hostname: 'example.com', port: null });
  });

  test('invalid url returns null', () => {
    expect(getHostAndPort('abc', '')).toBeNull();
  });
});

describe('urlsMatch', () => {
  test('matches same hostname and port', () => {
    expect(urlsMatch('http://example.com', '4502', 'http://example.com:4502/foo')).toBe(true);
  });

  test('default ports are considered', () => {
    expect(urlsMatch('https://example.com', '', 'https://example.com/foo')).toBe(true);
  });

  test('different hostnames do not match', () => {
    expect(urlsMatch('http://example.com', '', 'http://other.com')).toBe(false);
  });
});
