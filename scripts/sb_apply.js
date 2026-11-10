const fs = require("fs");
const { sql } = require("./sb_admin.js");
const file = process.argv[2];
(async () => {
  const q = fs.readFileSync(file, "utf8");
  const r = await sql(q);
  console.log(r.status, r.body.slice(0, 1500));
})();
