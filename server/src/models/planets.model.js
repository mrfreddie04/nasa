const { createReadStream } = require("fs");
const path = require("path");
const { parse } = require('csv-parse');
const planets = require("./planets.mongo");

const isHabitablePlanet = (planet) => {
  return (
    planet["koi_disposition"] === "CONFIRMED" 
    && planet["koi_insol"] 
    && !isNaN(planet["koi_insol"]) && parseFloat(planet["koi_insol"]) > 0.36 && parseFloat(planet["koi_insol"]) < 1.11
    && planet["koi_prad"] && !isNaN(planet["koi_prad"]) && parseFloat(planet["koi_prad"]) < 1.6
  );
};

function loadPlanetsData() {
  return new Promise((resolve,reject) => {
    createReadStream(path.join(__dirname,"..","..","data","kepler_data.csv"))
    .pipe(parse({
      comment: "#",
      columns: true
    }))
    .on("data", async (data) => {
      if(isHabitablePlanet(data)) {
        await savePlanet(data);
      }
    })
    .on("error", (err) => {
      console.log(err);
      reject(err);
    })
    .on("end", async () => {
      const countPlanetsCount = (await getAllPlanets()).length;
      console.log(`${countPlanetsCount} habitable planets found!`);      
      resolve();
    });
  });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {keplerName: planet.kepler_name},
      {keplerName: planet.kepler_name},
      {upsert: true}
    );  
  } catch(err) {
    console.error(`We could not save planet ${err}`);
  }
}

async function getAllPlanets() {
  return await planets.find({},{ "_id":0, "__v":0});
}

module.exports = {
  loadPlanetsData,
  getAllPlanets
};