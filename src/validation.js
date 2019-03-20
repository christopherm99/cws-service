var email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var decimal = /^\d+\.\d+|\d+$/;

function notEmpty(input) {
  return input ? true : "Required";
}

function underLength(len) {
  return input => {
    return input.length <= len ? true : `May not exceed ${len}`;
  };
}

function isDecimal(input) {
  return decimal.test(input) ? true : "Must be a (decimal) number";
}

function isEmail(input) {
  return email.test(input) ? true : "Must be a valid email";
}

export { notEmpty, underLength, isDecimal, isEmail };
