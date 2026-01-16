rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "localhost:27017" }]
});

while (rs.status().myState !== 1) {
  sleep(1000);
}

db = db.getSiblingDB('lead_scoring_system');

try {
  db.scoringrules.insertMany([
    { eventType: "visit", points: 5 },
    { eventType: "signup", points: 20 },
    { eventType: "download", points: 10 }
  ], { ordered: false });
  print("Scoring rules initialized");
} catch (e) {
  if (e.code === 11000) {
    print("Rules already exist");
  } else {
    throw e;
  }
}
