const request = require("supertest");
// const { MongoMemoryServer } = require("mongodb-memory-server");
// const mongoose  = require("mongoose");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
//const { loadPlanetsData, getAllPlanets } = require("../../models/planets.model");

describe("Launches API", () => {
  let mongo;

  beforeAll(async () => {
    await mongoConnect();
    // mongo = await MongoMemoryServer.create();
    // const mongoUri = mongo.getUri();
  
    // console.log("Mongo Uri: ", mongoUri);
    // //await mongoConnect(mongoUri);  
    // await mongoose.connect(mongoUri, {dbName: "nasa"});  

    // await loadPlanetsData();
    // console.log("Planets loaded");
    // //const planets = await getAllPlanets();
  });

  afterAll(async () => {
    await mongoDisconnect(); 
    // console.log("Running afterAll");
    // await mongo.stop();
    // console.log("Stopped");
    // //await mongoDisconnect();     
    // await mongoose.disconnect(); 
    // console.log("Disconnected");
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
                  .get("/v1/launches")
                  .send()
                  .expect("Content-Type", /json/)
                  .expect(200);
    });
  });
  
  describe("Test POST /launches", () => {
    const completeLaunchObject = {
      mission: "ZMT3333",  
      rocket: "Progress Krasnaya Zvezda",
      launchDate: "December 5, 2025",
      target: "Kepler-62 f"
    };
  
    const { launchDate,...rest} = completeLaunchObject;
    const launchObjectWithoutDate = {...rest};
  
    const invalidDateLaunchObject = {
      ...rest,
      launchDate: "some garbage"
    }  
  
    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchObject)
        .expect("Content-Type", /json/)
        .expect(201);    
        
      const requestDate = new Date(launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
        
      expect(requestDate).toEqual(responseDate);
  
      expect(response.body).toMatchObject(launchObjectWithoutDate);      
    });  
  
    test("It should catch missing required properties and respond with 400 bad request", async ()=>{
      const response = await request(app)
        .post("/v1/launches")
        .send(launchObjectWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);     
        
      expect(response.body).toStrictEqual({error: "Missing required launch property"});      
    });
  
    test("It should catch invalid dates and respond with 400 bad request", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(invalidDateLaunchObject)
        .expect(400);     
        
      expect(response.body).toStrictEqual({error: "Invalid Launch Date"});         
    });  
  });
});

