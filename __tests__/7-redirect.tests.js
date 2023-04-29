import fs from 'fs';
import url from 'url';
import httpHeaders from 'http-headers';
import build from '../server/server.js';

test('should work', async () => {
  const app = build();

  const data = fs.readFileSync('solutions/7-redirect', 'utf-8');
  const requestObj = httpHeaders(
    data
      .split('\n')
      .map((el) => el.trim())
      .join('\r\n'),
  );
  
  const { headers: { host } } = requestObj;
  expect(host).toEqual('localhost');

  expect(requestObj.version).toEqual({ major: 1, minor: 1 });

  const parts = {
    port: 8080,
    protocol: 'http',
    hostname: 'localhost',
    pathname: requestObj.url,
  };
  const requestUrl = url.format(parts);

  const headers = Object.entries(requestObj.headers)
    .reduce((acc, [header, value]) => (
      { ...acc, [header]: value.split(',').join('; ') }
    ), {});

  const options = {
    headers,
    method: requestObj.method,
    url: requestUrl,
  };

  const { statusCode } = await app.inject(options);

  expect(statusCode).toEqual(302);
});
