/* eslint-disable no-console */
/* eslint-disable max-len */
// Write code here
// Also, you can create additional files in the src folder
// and import (require) them here
const http = require('http');
const url = require('url');
const { convertToCase } = require('./convertToCase');
// const { error } = require('console');

const ERROR_MESSAGES = {
  NO_TEXT:
    'Text to convert is required. Correct request is: "/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>".',
  NO_CASE:
    '"toCase" query param is required. Correct request is: "/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>".',
  WRONG_CASE:
    'This case is not supported. Available cases: SNAKE, KEBAB, CAMEL, PASCAL, UPPER.',
};

const SUPPORTED_CASES = ['SNAKE', 'KEBAB', 'CAMEL', 'PASCAL', 'UPPER'];

function createServer() {
  const server = http.createServer((request, response) => {
    const normUrl = new url.URL(request.url, `http://${request.headers.host}`);
    const textToConvert = normUrl.pathname.replace('/', '');
    const caseType = normUrl.searchParams.get('toCase');

    response.setHeader('Content-Type', 'application/json');

    const validationErrors = validateRequest(textToConvert, caseType);

    if (validationErrors.length) {
      return handleError(response, validationErrors);
    }

    try {
      const { originalCase, convertedText } = convertToCase(
        textToConvert,
        caseType,
      );

      handleSuccess(
        response,
        textToConvert,
        originalCase,
        caseType,
        convertedText,
      );
    } catch (error) {
      handleInternalError(response);
    }
  });

  return server;
}

function validateRequest(textToConvert, caseType) {
  const errors = [];

  if (!textToConvert) {
    errors.push({ message: ERROR_MESSAGES.NO_TEXT });
  }

  if (!caseType) {
    errors.push({ message: ERROR_MESSAGES.NO_CASE });
  }

  if (caseType && !SUPPORTED_CASES.includes(caseType.toUpperCase())) {
    errors.push({ message: ERROR_MESSAGES.WRONG_CASE });
  }

  return errors;
}

function handleSuccess(
  response,
  originalText,
  originalCase,
  targetCase,
  convertedText,
) {
  response.statusCode = 200;
  response.statusMessage = 'OK';

  const result = {
    originalCase,
    targetCase,
    originalText,
    convertedText,
  };

  response.end(
    JSON.stringify(result),
    console.log(result, response.statusCode, response.statusMessage),
  );
}

function handleError(response, errors) {
  response.statusCode = 400;
  response.statusMessage = 'Bad request';

  response.end(
    JSON.stringify({ errors }),
    console.log(
      JSON.stringify({ errors }),
      response.statusCode,
      response.statusMessage,
    ),
  );
}

function handleInternalError(response) {
  response.statusCode = 500;
  response.statusMessage = 'Internal Server Error';

  response.end(
    JSON.stringify(
      {
        errors: [
          {
            message: 'An unexpected error occurred. Please try again later.',
          },
        ],
      },
      console.log(
        JSON.stringify({
          errors: [
            {
              message: 'An unexpected error occurred. Please try again later.',
            },
          ],
        }),
        response.statusCode,
        response.statusMessage,
      ),
    ),
  );
}

module.exports = { createServer };
