let string = "#ffbbad #Fc01DF #FFF #ffE"
let regex = /#([a-fA-F\d]{6}|[a-fA-F\d]{3})/g

const result = string.match(regex);

console.log("result :>> ", result);
console.log('result.length :>> ', result.length);
