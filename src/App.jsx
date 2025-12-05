import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [emailInput, setEmailInput] = useState("");
  const [myReports, setMyReports] = useState([]);

  const [adminFile, setAdminFile] = useState(null);
  const [adminPhone, setAdminPhone] = useState("");

  // -------------------------
  // AUTH LISTENER
  // -------------------------
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);

      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // -------------------------
  // SEND MAGIC LINK
  // -------------------------
  async function sendMagicLink() {
    if (!emailInput) return alert("Please enter email");

    const { error } = await supabase.auth.signInWithOtp({
      email: emailInput,
    });

    if (error) return alert(error.message);

    alert("Login link sent! Check your email.");
  }

  // -------------------------
  // LOGOUT
  // -------------------------
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  // -------------------------
  // LOAD PROFILE
  // -------------------------
  async function loadProfile(uid) {
    const { data } = await supabase.from("users").select("*").eq("uid", uid).single();

    if (data) {
      setProfile(data);
      if (data.phone) fetchReports(data.phone);
    }
  }

  // -------------------------
  // SAVE PROFILE (FIRST TIME)
  // -------------------------
  async function saveProfile(name, phone) {
    if (!user) return;

    await supabase.from("users").upsert({
      uid: user.id,
      name,
      phone,
      email: user.email,
      isAdmin: false,
    });

    setProfile({ uid: user.id, name, phone, email: user.email, isAdmin: false });
    fetchReports(phone);
  }

  // -------------------------
  // FETCH REPORTS
  // -------------------------
  async function fetchReports(phone) {
    const { data } = await supabase.from("reports").select("*").eq("phone", phone);
    setMyReports(data || []);
  }

  // -------------------------
  // ADMIN: UPLOAD REPORT
  // -------------------------
  async function adminUpload(e) {
    e.preventDefault();
    if (!profile?.isAdmin) return alert("Not admin");
    if (!adminPhone || !adminFile) return alert("Enter phone + choose file");

    const path = `reports/${adminPhone}_${Date.now()}_${adminFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(path, adminFile);

    if (uploadError) return alert(uploadError.message);

    const { data: urlData } = supabase.storage.from("reports").getPublicUrl(path);

    await supabase.from("reports").insert({
      phone: adminPhone,
      fileName: adminFile.name,
      url: urlData.publicUrl,
    });

    alert("Uploaded!");
    fetchReports(adminPhone);
  }

  // -------------------------
  // MAIN UI
  // -------------------------
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white p-4 shadow flex justify-between">
        <h1 className="font-bold text-xl">Bagree Diagnostic Centre</h1>

        {user ? (
          <button onClick={logout} className="px-3 py-2 bg-red-500 text-white rounded">
            Logout
          </button>
        ) : null}
      </header>

      <main className="max-w-3xl mx-auto p-4">

        {/* ---------------- LOGIN SCREEN ---------------- */}
        {!user && (
          <div className="bg-white p-6 shadow rounded mt-6">
            <h2 className="text-2xl font-bold mb-3">Login to View Your Reports</h2>

            <input
              className="p-2 border w-full mb-3"
              type="email"
              placeholder="Enter your email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />

            <button
              onClick={sendMagicLink}
              className="px-4 py-2 bg-blue-600 text-white rounded w-full"
            >
              Send Login Link
            </button>

            <p className="text-sm text-gray-600 mt-2">
              A secure login link will be sent to your email.
            </p>
          </div>
        )}

        {/* ---------------- FIRST TIME PROFILE SETUP ---------------- */}
        {user && !profile && (
          <div className="bg-white p-6 shadow rounded mt-6">
            <h3 className="text-xl font-semibold mb-3">Complete Your Profile</h3>

            <ProfileForm onSave={saveProfile} />
          </div>
        )}

        {/* ---------------- LOGGED IN USER ---------------- */}
        {user && profile && (
          <>
            <section className="bg-white p-4 shadow rounded mt-6">
              <h3 className="text-xl font-bold">Welcome, {profile.name}</h3>
              <p>Email: {profile.email}</p>
              <p>Phone: {profile.phone}</p>
            </section>

            {/* REPORTS SECTION */}
            <section className="bg-white p-4 shadow rounded mt-6">
              <h3 className="font-semibold mb-3">Your Reports</h3>

              {myReports.length === 0 && <p>No reports uploaded yet.</p>}

              {myReports.map((r) => (
                <div
                  key={r.id}
                  className="border p-3 rounded mb-2 flex justify-between"
                >
                  <span>{r.fileName}</span>
                  <a
                    href={r.url}
                    target="_blank"
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Download
                  </a>
                </div>
              ))}
            </section>

            {/* ADMIN PANEL */}
            {profile.isAdmin && (
              <section className="bg-white p-4 shadow rounded mt-6">
                <h3 className="font-semibold mb-3">Admin: Upload Report</h3>

                <form onSubmit={adminUpload} className="grid gap-3">
                  <input
                    className="p-2 border"
                    placeholder="Patient phone"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                  />

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setAdminFile(e.target.files?.[0] || null)}
                  />

                  <button className="px-4 py-2 bg-green-600 text-white rounded">
                    Upload
                  </button>
                </form>
              </section>
            )}
          </>
        )}

      </main>
    </div>
  );
}

// --------------------------------------------------

function ProfileForm({ onSave }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name || !phone) return alert("Fill all fields");
        onSave(name, phone);
      }}
      className="grid gap-3"
    >
      <input
        className="p-2 border"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="p-2 border"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button className="px-4 py-2 bg-blue-600 text-white rounded">
        Save
      </button>
    </form>
  );
}
