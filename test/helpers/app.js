const { Readable, Writable } = require("stream");

function request(app, path) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    const request = new Readable({
      read() {
        this.push(null);
      }
    });
    const response = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      }
    });

    request.method = "GET";
    request.url = path;
    request.headers = { host: "localhost" };
    request.socket = {};

    response.statusCode = 404;
    response.headers = {};
    response.setHeader = function (name, value) {
      response.headers[name.toLowerCase()] = value;
    };
    response.getHeader = function (name) {
      return response.headers[name.toLowerCase()];
    };
    response.removeHeader = function (name) {
      delete response.headers[name.toLowerCase()];
    };
    response.writeHead = function (statusCode, headers) {
      response.statusCode = statusCode;
      if (headers) {
        for (const [name, value] of Object.entries(headers)) {
          response.setHeader(name, value);
        }
      }
    };

    response.end = function (chunk, encoding, callback) {
      if (chunk) {
        chunks.push(Buffer.from(chunk, encoding));
      }
      Writable.prototype.end.call(response, callback);
    };

    response.on("finish", function () {
      resolve({
        statusCode: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks).toString("utf8")
      });
    });
    response.on("error", reject);

    app.callback()(request, response).catch(reject);
  });
}

module.exports = { request };
