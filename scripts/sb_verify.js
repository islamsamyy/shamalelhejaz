const { env, t, r, api, sql } = require("./sb_admin.js");
(async () => {
  const a = await sql("select c.relname, c.relrowsecurity rls, (select count(*) from pg_policies p where p.tablename=c.relname and p.schemaname='public') pol from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' order by 1");
  console.log(JSON.parse(a.body).map((x) => `${x.relname} rls=${x.rls} policies=${x.pol}`).join("\n"));
  for (const type of ["security", "performance"]) {
    const res = await fetch(`${api}/advisors/${type}`, { headers: { Authorization: "Bearer " + t } });
    const txt = await res.text();
    console.log(type, res.status);
    try {
      const j = JSON.parse(txt);
      (j.lints || []).forEach((l) => console.log(" -", l.level, l.name, l.metadata && l.metadata.name));
    } catch { console.log(txt.slice(0, 300)); }
  }
  const pub = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const h = { apikey: pub, Authorization: "Bearer " + pub, "Content-Type": "application/json" };
  const base = `https://${r}.supabase.co/rest/v1/`;
  for (const tb of ["orders", "payments", "wallets", "profiles", "payment_gateways", "app_settings", "categories"]) {
    const res = await fetch(base + tb + "?select=*&limit=1", { headers: h });
    console.log("anon read", tb, res.status, (await res.text()).slice(0, 80));
  }
  const ins = await fetch(base + "reviews", { method: "POST", headers: h, body: JSON.stringify({ product_id: "x", author: "a", rating: 5, comment: "c" }) });
  console.log("anon insert review", ins.status);
  const rpc = await fetch(base + "rpc/create_order_secure", { method: "POST", headers: h, body: "{}" });
  console.log("anon rpc create_order_secure", rpc.status);
})();
