const { env, sql } = require("./sb_admin");

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !secretKey || !anonKey) {
  console.error("Missing Supabase URL or keys in .env.local");
  process.exit(1);
}

const ACCOUNTS = [
  {
    email: "admin@souq.sa",
    password: "Admin@123",
    role: "admin",
    full_name: "م. فهد السبيعي (المشرف العام)",
    phone: "0500000001",
  },
  {
    email: "vendor@souq.sa",
    password: "Vendor@123",
    role: "vendor",
    full_name: "شركة آفاق التقنية للتجارة (B2B)",
    phone: "0559876543",
    vendor: {
      id: "modern-tech",
      name: "شركة آفاق التقنية للتجارة",
      slug: "modern-tech",
      badge: "شريك استراتيجي معتمد",
      verified: true,
      status: "approved",
      location: "الرياض",
      cr_number: "1010884920",
      vat_number: "310000000000003",
    },
  },
  {
    email: "customer@souq.sa",
    password: "Customer@123",
    role: "customer",
    full_name: "سلطان العتيبي (مقتني VIP)",
    phone: "0501234567",
  },
];

async function authAdmin(path, method = "GET", body) {
  const res = await fetch(`${url}/auth/v1/admin${path}`, {
    method,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Auth admin ${method} ${path} failed (${res.status}): ${text}`);
  return text ? JSON.parse(text) : null;
}

async function run() {
  const listData = await authAdmin("/users?per_page=200");
  const existingByEmail = new Map((listData?.users || []).map((u) => [u.email?.toLowerCase(), u]));

  for (const acc of ACCOUNTS) {
    let user = existingByEmail.get(acc.email.toLowerCase());
    if (user) {
      user = await authAdmin(`/users/${user.id}`, "PUT", {
        password: acc.password,
        email_confirm: true,
        user_metadata: { full_name: acc.full_name, phone: acc.phone },
      });
      console.log(`Updated existing auth user: ${acc.email} (${user.id})`);
    } else {
      user = await authAdmin("/users", "POST", {
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: { full_name: acc.full_name, phone: acc.phone },
      });
      console.log(`Created auth user: ${acc.email} (${user.id})`);
    }

    // Upsert profile with exact DB role via SQL
    const qProfile = `
      insert into public.profiles (id, email, full_name, phone, role)
      values ('${user.id}', '${acc.email}', '${acc.full_name.replace(/'/g, "''")}', '${acc.phone}', '${acc.role}')
      on conflict (id) do update set
        email = excluded.email,
        full_name = excluded.full_name,
        phone = excluded.phone,
        role = excluded.role,
        updated_at = now();
      insert into public.wallets (user_id) values ('${user.id}') on conflict (user_id) do nothing;
    `;
    const rProf = await sql(qProfile);
    if (rProf.status >= 300) throw new Error(`Profile SQL failed: ${rProf.body}`);

    if (acc.vendor) {
      const v = acc.vendor;
      const qVendor = `
        insert into public.vendors (id, name, slug, badge, verified, status, location, cr_number, vat_number, owner_id)
        values ('${v.id}', '${v.name}', '${v.slug}', '${v.badge}', ${v.verified}, '${v.status}', '${v.location}', '${v.cr_number}', '${v.vat_number}', '${user.id}')
        on conflict (id) do update set
          name = excluded.name,
          slug = excluded.slug,
          badge = excluded.badge,
          verified = excluded.verified,
          status = excluded.status,
          owner_id = excluded.owner_id;
      `;
      const rVen = await sql(qVendor);
      if (rVen.status >= 300) throw new Error(`Vendor SQL failed: ${rVen.body}`);
      console.log(`Linked vendor store '${v.id}' to ${acc.email}`);
    }
  }

  console.log("\nVerifying real signInWithPassword + profile RLS read for each role...");
  for (const acc of ACCOUNTS) {
    const tokenRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: acc.email, password: acc.password }),
    });
    if (!tokenRes.ok) {
      throw new Error(`Sign-in failed for ${acc.email}: ${await tokenRes.text()}`);
    }
    const session = await tokenRes.json();
    const profRes = await fetch(`${url}/rest/v1/profiles?id=eq.${session.user.id}&select=email,role,full_name`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const profiles = await profRes.json();
    console.log(`✓ ${acc.email} -> role=${profiles[0]?.role} (${profiles[0]?.full_name})`);
  }
}

run().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
