import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Final polished UI for Bagree Diagnostic Centre
// Features:
// - Google sign-in
// - One-time profile capture (name + phone)
// - Admin panel (visible when users.isAdmin = true)
// - Upload PDF reports to Supabase Storage (bucket: reports) and save metadata in `reports` table
// - Patients see only reports linked to their phone

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myReports, setMyReports] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [adminPhone, setAdminPhone] = useState("");
  const [adminFile, setAdminFile] = useState(null);

  const [query, setQuery] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadProfile(uid) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("uid", uid)
      .maybeSingle();

    if (data) {
      setProfile(data);
      if (data.phone) fetchReports(data.phone);
    } else {
      setProfile(null);
    }

    setLoading(false);
  }

  async function signIn() {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function saveProfile(name, phone) {
    if (!user) return alert("Sign in first");
    await supabase.from("users").upsert({
      uid: user.id,
      name,
      phone,
      email: user.email,
      isAdmin: false,
    });
    setProfile({
      uid: user.id,
      name,
      phone,
      email: user.email,
      isAdmin: false,
    });
    fetchReports(phone);
  }

  async function fetchReports(phone) {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .eq("phone", phone);

    setMyReports(data || []);
  }

  async function handleAdminUpload(e) {
    e.preventDefault();
    if (!profile?.isAdmin) return alert("You are not an admin");
    if (!adminPhone || !adminFile) return alert("Enter phone & choose a PDF");

    setUploading(true);

    try {
      const path = `reports/${adminPhone}_${Date.now()}_${adminFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(path, adminFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("reports")
        .getPublicUrl(path);

      await supabase.from("reports").insert({
        phone: adminPhone,
        fileName: adminFile.name,
        url: urlData.publicUrl,
      });

      alert("Report uploaded successfully!");

      if (profile.phone === adminPhone) fetchReports(adminPhone);

      setAdminFile(null);
      setAdminPhone("");
    } catch (err) {
      alert(err.message);
    }

    setUploading(false);
  }

  const tests = [
    { id: 1, name: "Complete Blood Count (CBC)", price: "₹250" },
    { id: 2, name: "Thyroid Profile (T3, T4, TSH)", price: "₹650" },
    { id: 3, name: "Lipid Profile", price: "₹450" },
  ];

  const filteredTests = tests.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  if (loading)
    return <div className="p-6 text-center text-lg">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center text-white font-bold">
              BD
            </div>
            <div>
              <h1 className="text-lg font-semibold">Bagree Diagnostic Centre</h1>
              <p className="text-sm text-gray-500">
                Digital Reports | Home Collection | Pathology
              </p>
            </div>
          </div>

          <div>
            {user ? (
              <button
                onClick={signOut}
                className="px-4 py-2 border rounded shadow"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={signIn}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {!user && (
          <section className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-2xl font-bold">Get Your Test Reports Online</h2>
            <p className="mt-2 text-gray-600">
              Sign in to access your medical reports securely.
            </p>

            <div className="mt-4">
              <button
                onClick={signIn}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Sign in with Google
              </button>
            </div>
          </section>
        )}

        {user && !profile && (
          <section className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-3">
              Complete your profile
            </h3>
            <ProfileForm onSave={saveProfile} />
          </section>
        )}

        {user && profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <section className="bg-white p-6 rounded shadow">
                <h3 className="text-lg font-semibold">Welcome, {profile.name}</h3>
                <p className="text-sm text-gray-500">
                  Phone: {profile.phone}
                </p>
              </section>

              <section className="bg-white p-6 rounded shadow mt-6">
                <h3 className="text-lg font-semibold mb-3">Your Reports</h3>

                {myReports.length === 0 ? (
                  <p className="text-gray-600">No reports available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {myReports.map((r) => (
                      <div
                        key={r.id}
                        className="border p-3 rounded flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{r.fileName}</div>
                        </div>

                        <a
                          href={r.url}
                          target="_blank"
                          className="px-3 py-2 bg-blue-600 text-white rounded"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside>
              {profile.isAdmin ? (
                <section className="bg-white p-6 rounded shadow">
                  <h3 className="font-semibold mb-3">Admin — Upload Report</h3>

                  <form onSubmit={handleAdminUpload} className="space-y-3">
                    <input
                      className="p-2 border rounded w-full"
                      placeholder="Patient Phone"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                    />

                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setAdminFile(e.target.files?.[0] || null)}
                    />

                    <button
                      disabled={uploading}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  </form>
                </section>
              ) : (
                <section className="bg-white p-6 rounded shadow text-sm">
                  <p>
                    To access admin features, set <b>isAdmin = true</b> in the
                    users table.
                  </p>
                </section>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function ProfileForm({ onSave }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name || !phone) return alert("Enter all details");
        onSave(name, phone);
      }}
      className="grid gap-3"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-2 border rounded"
        placeholder="Full Name"
      />

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="p-2 border rounded"
        placeholder="Phone Number"
      />

      <button className="px-4 py-2 bg-blue-600 text-white rounded">
        Save
      </button>
    </form>
  );
}
