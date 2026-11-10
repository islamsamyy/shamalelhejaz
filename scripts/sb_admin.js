const fs = require("fs");
const env = Object.fromEntries(
  fs.readFileSync("d:/SOUQ/.env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
);
const t = env.SUPABASE_ACCESS_TOKEN, r = env.SUPABASE_PROJECT_REF;
const api = "https://api.supabase.com/v1/projects/" + r;
async function sql(query) {
  const res = await fetch(api + "/database/query", { method: "POST", headers: { Authorization: "Bearer " + t, "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
  return { status: res.status, body: await res.text() };
}
module.exports = { env, t, r, api, sql };
if (require.main === module) {
  (async () => {
    const k = await fetch(api + "/api-keys", { headers: { Authorization: "Bearer " + t } });
    console.log("keys", k.status);
    if (k.ok) {
      const j = await k.json();
      console.log(j.map((x) => x.name + ":" + x.type + ":" + (x.type === "publishable" ? x.api_key : "hidden")).join("\n"));
    } else console.log((await k.text()).slice(0, 200));
    const q = await sql("select t.table_name, (select count(*) from information_schema.columns c where c.table_name=t.table_name and c.table_schema='public') as cols, (select count(*) from pg_policies p where p.tablename=t.table_name) as policies from information_schema.tables t where table_schema='public'");
    console.log("sql", q.status, q.body.slice(0, 1500));
    const rows = await sql("select (select count(*) from products) p,(select count(*) from categories) c,(select count(*) from vendors) v");
    console.log("rows", rows.status, rows.body);
  })();
}
