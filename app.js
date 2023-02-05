const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.get("/states/", async (req, res) => {
  try {
    let query =
      "select state_id as stateId , state_name as stateName ,population from state";
    let result = await db.all(query);
    res.send(result);
  } catch (e) {
    console.log(e.message);
  }
});

app.get("/states/:stateId", async (req, res) => {
  try {
    let stateId = req.params.stateId;
    let query = `select state_id as stateId , state_name as stateName ,population from state where  state_id=${stateId}`;
    let result = await db.get(query);
    res.send(result);
  } catch (e) {
    console.log(e.message);
  }
});

app.post("/districts", async (req, res) => {
  try {
    let { districtName, stateId, cases, cured, active, deaths } = req.body;
    let query = `INSERT INTO district (district_name,state_id,cases,cured,active,deaths) values ('${districtName}',${stateId},${cases},${cured}, ${active},${deaths})`;
    let result = await db.run(query);
    res.send("District Successfully Added");
  } catch (e) {
    console.log(e.message);
  }
});

app.get("/districts/:districtId", async (req, res) => {
  try {
    let { districtId } = req.params;
    let query = `select district_id as districtId,district_name as districtName,state_id as stateId,cases,cured,active,deaths from district where  district_id=${districtId}`;
    let result = await db.get(query);
    res.send(result);
  } catch (e) {
    console.log(e.message);
  }
});

app.delete("/districts/:districtId", async (req, res) => {
  try {
    let districtId = req.params.districtId;
    let query = `DELETE  from district where  district_id=${districtId}`;
    let result = await db.run(query);
    res.send("District Removed");
  } catch (e) {
    console.log(e.message);
  }
});

app.put("/districts/:districtId", async (req, res) => {
  try {
    let districtId = req.params.districtId;
    let { districtName, stateId, cases, cured, active, deaths } = req.body;
    let query = `UPDATE district set  district_name='${districtName}',state_id=${stateId},cases=${cases},cured='${cured}',active='${active}',deaths=${deaths} where  district_id=${districtId}`;
    let result = await db.run(query);
    res.send("District Details Updated");
  } catch (e) {
    console.log(e.message);
  }
});

app.get("/states/:stateId/stats/", async (req, res) => {
  try {
    let { stateId } = req.params;
    let query = `select sum(cases) as totalCases,sum(cured) as totalCured, sum(active) as totalActive,sum(deaths) as totalDeaths from district where state_id =${stateId} `;
    let result = await db.get(query);
    res.send(result);
  } catch (E) {
    console.log(E.message);
  }
});

app.get("/districts/:districtId/details/", async (req, res) => {
  try {
    let { districtId } = req.params;
    let query = `select state_name as stateName from state where state_id in (select state_id from district where district_id =${districtId})`;
    // console.log(re)
    let result = await db.get(query);
    res.send(result);
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = app;
