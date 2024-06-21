const {seed}=require('../db/seed');
const data= require('../test-data/users')

console.log("seeding");
seed(data);
console.log('done')