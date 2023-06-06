const loader1 = source => {
  return source + "//loader1";
}

const loader2 = source => {
  return source + "//loader2";
}

module.exports = {
  loader1,
  loader2
}