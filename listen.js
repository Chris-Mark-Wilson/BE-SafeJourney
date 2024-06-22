const app = require('./app.js')
require('dotenv').config({path:`${__dirname}/.env.development`})
const { PORT = 9090 } = process.env

app.listen(PORT, () => console.log(`Listening on ${PORT}...`))