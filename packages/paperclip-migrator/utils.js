const seed = Math.round(Math.random() * 999999999) + "";
let count = 0;
exports.generateID = () => {
  return seed + (count++);
};