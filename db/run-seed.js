const {seed}=require('../db/seed');
const data= require('../test-data/blankusers')

console.log("seeding");
seed(data);
console.log('done')