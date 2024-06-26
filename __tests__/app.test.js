const app = require("../app")
const request = require("supertest")
const { seed } = require('../db/seed')
const data = require('../test-data/users')
const db = require("../db/connection")

beforeEach(() => {
    return seed(data)
})
  
afterAll(() => {
    return db.close()
})

describe('GET /api/users/:user_id', () => {
    test('200: Should return a user object with the given id', async () => {
        const { body: { user } } = await request(app)
            .get("/api/users/1")
            .expect(200)
        expect(user).toHaveProperty('user_id', 1)
        expect(user).toHaveProperty('name', 'Gemma')
        expect(user).toHaveProperty('location')
        expect(user).toHaveProperty('friendList')
    })
    test('404: should return "User not found" if given an invalid user_id', async () => {
        const { body: { msg } } = await request(app)
            .get("/api/users/99")
            .expect(404)
        expect(msg).toBe("User not found")
    })
})

describe('POST /api/users/', () => {
    const newUser = {name: "Johny English", phoneNumber: '07900000007'}
    const incompleteUser = {phoneNumber: '07900000007'}

    test('201: Should return a user object with the given id', async () => {
        const { body: { user } } = await request(app)
            .post("/api/users")
            .send(newUser)
            .expect(201)
        expect(user).toHaveProperty('user_id', 7)
        expect(user).toHaveProperty('name', "Johny English")
        expect(user.location).toEqual({
            status: false,
            start: {lat: null, long: null},
            current: {lat: null, long: null},
            end: {lat: null, long: null}
        })
        expect(user.friendList).toEqual([])
    })
    test("400: should generate a 400 error with an incomplete user", async ()=>{
        const { body: { msg }} = await request(app)
            .post("/api/users")
            .send(incompleteUser)
            .expect(400)
        expect(msg).toBe('Invalid input')
    })
    test("404: should generate a 404 error with a wrong path", async ()=>{
        const { body: { msg }} = await request(app)
            .post("/api/userss")
            .send(newUser)
            .expect(404)
        expect(msg).toBe('Not found')
    })
})

describe("PATCH api/users/:user_id/friends", ()=>{
    test("201 changes the list of friends of a user", async ()=>{
        const newFriend = {phoneNumber: '07900000001'}
        const { body: { acknowledged } } = await request(app)
            .patch('/api/users/6/friends')
            .send(newFriend)
            .expect(201)
        expect(acknowledged).toBe(true)

        const { body: { user : { friendList }} } = await request(app).get("/api/users/6")
        expect(friendList).toEqual([2, 3, 4, 1])
    })
    test('404: Should return "Invalid phone number" if given a phone number that does not exist', async () => {
        const newFriend = {phoneNumber: '07900000099'}
        const { body: { msg } } = await request(app)
            .patch('/api/users/6/friends')
            .send(newFriend)
            .expect(404)
        expect(msg).toBe("Invalid phone number")
    })
})

describe("PATCH /api/users/:user_id/location", () => {
    test("201 should update the status", async ()=>{
        const update = {status: true, start: {lat:1, long:1}, end: {lat:2, long:2}}

        const { body: { acknowledged } } = await request(app)
            .patch('/api/users/6/location')
            .send(update)
            .expect(201)
        expect(acknowledged).toBe(true)

        const { body: { user : { location }} } = await request(app).get("/api/users/6")
        expect(location).toHaveProperty("status", true)
    })
    test("201 should update the start location", async ()=>{
        const update = {status: true, start: {lat:1, long:1}, end: {lat:2, long:2}}

        const { body: { acknowledged } } = await request(app)
            .patch('/api/users/6/location')
            .send(update)
            .expect(201)
        expect(acknowledged).toBe(true)

        const { body: { user : { location }} } = await request(app).get("/api/users/6")
        expect(location).toHaveProperty("status", true)
        expect(location.start).toEqual({lat:1, long:1})
        expect(location.current).toEqual({lat:1, long:1})
        expect(location.end).toEqual({lat:2, long:2})
    })
})

describe("GET /api/users/:user_id/friends", () => {
    test("200 should return an array of friend objects", async ()=>{
        const { body: { friendList } } = await request(app)
            .get('/api/users/6/friends')
            .expect(200)
        expect(friendList).toEqual([{   
            user_id: 2,  
            name: 'Chris W',  
            phoneNumber: '07900000002',  
            location: {
                status: true,
                start: {lat: 53.810, long: -1.56},
                current: {lat: 53.81168, long: -1.5618},
                end: {lat: 53.81339, long: -1.5603}
            },  
        },
        {   user_id: 3,  
            name: 'Chris L',  
            phoneNumber: '07900000003',  
            location: {
                status: true,
                start: {lat: 53.8143, long: -1.57604},
                current: {lat: 53.81487, long: -1.56465},
                end: {lat: 53.81459, long: -1.5486}
            },  
        },
        {   user_id: 4,  
            name: 'Aminah',  
            phoneNumber: '07900000004',  
            location: { status: false,     
                        start: {lat: null, long: null},    
                        current: {lat: null, long: null},    
                        end: {lat: null, long: null}  
                    },  
        }])
    })
})

describe('Patch /api/user_id/location', () => {
    test('201: should update the current location', async() => {
        const updateLocation = {current: {lat: 1, long:1}}
        const {body:{acknowledged}} = await request(app).patch('/api/users/1/location')
        .send(updateLocation).expect(201)
        expect(acknowledged).toBe(true)
        const {body:{user:{location}}} = await request(app).get('/api/users/1')
        expect(location.current).toEqual({lat: 1, long:1})
    })
    test('201: should update the status to false and delete current data', async() => {
        const update = {status: false}
        const {body:{acknowledged}} = await request(app).patch('/api/users/1/location')
        .send(update).expect(201)
        expect(acknowledged).toBe(true)
        const {body:{user:{location}}} = await request(app).get('/api/users/1')
        expect(location.status).toBe(false)
        expect(location.start).toEqual({lat: null, long: null})
        expect(location.current).toEqual({lat: null, long: null})
        expect(location.end).toEqual({lat: null, long: null})
    })
})

describe('GET /api/login/:phone_number', () => {
    test('200: should return the user data if the number given exists', async() => {
        const { body: { user } } = await request(app)
            .get("/api/login/07900000001")
            .expect(200)
        expect(user).toHaveProperty('user_id', 1)
        expect(user).toHaveProperty('name', 'Gemma')
    })
    test('404: should return "Invalid phone number" if the given number does not exist', async() => {
        const { body: { msg } } = await request(app)
            .get("/api/login/07900000099")
            .expect(404)
        expect(msg).toBe("Invalid phone number")
    })
})