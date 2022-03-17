const axios = require("axios");

const launches = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  const launch = await findLaunch({flightNumber:launchId});
  return !!launch;
}

async function getAllLaunches(skip, limit) {
  return await launches
    .find({},{ "_id":0, "__v":0})
    .sort({"flightNumber": "asc"})
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    {flightNumber: launch.flightNumber},
    launch,
    {upsert: true}    
  );
}

async function getLatestFlightNumber() {
  // const [stats] = await launches.aggregate([
  //   { $group: { _id: null, maxFlightNumber: { $max: '$flightNumber' }}},
  //   { $project: { _id: 0, maxFlightNumber: 1 }}
  // ]);
  // return stats?.maxFlightNumber || 0;

  const latestLaunch = await launches
    .findOne()
    .sort("-flightNumber"); //"-" sort in descending order

  if(!latestLaunch) return DEFAULT_FLIGHT_NUMBER;

  return latestLaunch.flightNumber;  
}

async function scheduleNewLaunch(launch) {

  const planet = launch.target && await planets.findOne({keplerName: launch.target});

  if(!planet) {
    throw new Error(`No matching planet was found: ${launch.target}`);
  }

  const newFlightNumber = await getLatestFlightNumber() + 1;

  launch = {
    ...launch,
    customers: ["ZTM"],
    upcoming: true,
    success: true,
    flightNumber: newFlightNumber    
  }    

  await saveLaunch(launch);

  return launch;
}

async function abortLaunch(launchId) {
  const aborted = await launches.updateOne(
    { flightNumber: launchId },
    { $set: {upcoming: false, success: false }}     
  );

  return aborted.matchedCount === 1 && aborted.modifiedCount === 1;
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1, 
    rocket: "Falcon 1",
    mission: "FalconSat"
  });

  if(!!firstLaunch) {
    console.log("Launch data already loaded!")
    return;
  }

  await populateLaunches();
}

async function populateLaunches() {
    //make axios call to SpaceX API
    const response = await axios.post(SPACEX_API_URL,{
      query: {},
      options: {
        pagination: false,
        populate: [
          {
            path: 'rocket',
            select: {
              name: 1
            }
          },
          {
            path: 'payloads',
            select: {
              customers: 1
            }
          }
        ]
      }    
    });

    if(response.status !== 200) {
      console.log("Problem downloading launch data");
      throw new Error("Launch data download failed");
    }
  
    //map data
    const launchDocs = response.data.docs;
    const launches = launchDocs.map( launchDoc => {
      //const customers = new Set(launchDoc.payloads.map( payload => payload.customers).flat());
      const customers = [...new Set(launchDoc.payloads.flatMap( payload => payload.customers))];
      const launch = {
        flightNumber: launchDoc.flight_number,
        mission: launchDoc.name,
        rocket: launchDoc.rocket.name,
        launchDate: new Date(launchDoc.date_local),
        //target: "N/A",
        upcoming: launchDoc.upcoming,
        success: launchDoc.success,
        customers: customers
      };         
      return launch;
    });
  
    // console.log(launches.length);
    // console.log(launches.map(launch => launch.customers));
  
    //populate MongoDB
    console.log("Downloading launch data...");
    for(let launch of launches) {
      await saveLaunch(launch);
    }
}

module.exports = {
  loadLaunchData,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunch,
  existsLaunchWithId
};