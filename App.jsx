import React, { useState } from "react";

// Bagree Diagnostic Centre — Single-file React component (App)
// TailwindCSS utility classes assumed. Paste into a React + Tailwind project (Vite/CRA).

const servicesSample = [
  { id: 1, name: "Complete Blood Count (CBC)", desc: "Basic blood profile", price: "₹250" },
  { id: 2, name: "Thyroid Profile (T3,T4,TSH)", desc: "Thyrocare-style panel", price: "₹650" },
  { id: 3, name: "Lipid Profile", desc: "Cholesterol and triglycerides", price: "₹450" },
  { id: 4, name: "COVID-19 RT-PCR", desc: "Gold-standard viral test", price: "₹1200" },
  { id: 5, name: "Diabetes (HbA1c)", desc: "Long-term glucose marker", price: "₹600" }
];

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [booking, setBooking] = useState({ name: "", phone: "", email: "", date: "", time: "", test: "" });
  const [message, setMessage] = useState("");

  const filtered = servicesSample.filter((s) => (`${s.name} ${s.desc}`).toLowerCase().includes(query.toLowerCase()));

  async function submitBooking(e) {
    e.preventDefault();

    if (!booking.name || !booking.phone || !booking.date) {
      setMessage("Please fill name, phone and date.");
      return;
    }

    try {
      const res = await fetch("/api/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
      });

      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();

      setMessage("Booking confirmed. Reference: " + (data.ref || "NA"));
      setBooking({ name: "", phone: "", email: "", date: "", time: "", test: "" });
    } catch (err) {
      console.error(err);
      setMessage("Failed to book — save data locally and try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold">BD</div>
            <div>
              <h1 className="text-lg font-semibold">Bagree Diagnostic Centre</h1>
              <p className="text-sm text-gray-500">Trusted pathology &amp; diagnostic services</p>
            </div>
          </div>

          <nav className="hidden md:flex gap-6 items-center">
            <a href="#services" className="hover:underline">Services</a>
            <a href="#rates" className="hover:underline">Rate List</a>
            <a href="#book" className="hover:underline">Book Appointment</a>
            <a href="#reports" className="hover:underline">Reports</a>
            <a href="#contact" className="px-4 py-2 bg-blue-600 text-white rounded-md">Contact</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 items-center">
          <div>
            <h2 className="text-3xl font-extrabold">Complete diagnostics. Fast reports. Trusted care.</h2>
            <p className="mt-3 text-gray-700">Advanced lab testing including thyroid panels, preventive health checkups, radiology &amp; home collection. Reports available online &amp; via WhatsApp.</p>

            <div className="mt-6 flex gap-3">
              <a href="#book" className="px-5 py-3 bg-blue-600 text-white rounded-md">Book a Test</a>
              <a href="#rates" className="px-5 py-3 border rounded-md">View Rates</a>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>🕒 Fast Reports</div>
              <div>🏠 Home Sample Collection</div>
              <div>🔬 Accredited Lab</div>
              <div>💳 Online Payments</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md">
            <h3 className="font-semibold mb-3">Quick Test Search</h3>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by test name (e.g. Thyroid, CBC)"
              className="w-full border rounded-md p-2"
            />

            <div className="mt-3 max-h-64 overflow-auto">
              {filtered.map((s) => (
                <div key={s.id} className="p-3 border-b last:border-b-0 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-500">{s.desc}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">{s.price}</div>
                    <button
                      onClick={() => {
                        setSelectedService(s);
                        setBooking((b) => ({ ...b, test: s.name }));
                      }}
                      className="mt-2 px-3 py-1 text-sm border rounded-md"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && <div className="p-3 text-gray-500">No tests found. Try different keyword.</div>}
            </div>

            {selectedService && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <div className="font-medium">Selected: {selectedService.name}</div>
                <div className="text-sm text-gray-600">{selectedService.desc} • {selectedService.price}</div>
              </div>
            )}
          </div>
        </section>

        {/* Services Grid */}
        <section id="services" className="my-8">
          <h3 className="text-2xl font-semibold mb-4">Our Services</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicesSample.map((s) => (
              <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-gray-600 mt-1">{s.desc}</div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="font-medium">{s.price}</div>
                  <button
                    onClick={() => {
                      setSelectedService(s);
                      window.location.hash = "#book";
                      setBooking((b) => ({ ...b, test: s.name }));
                    }}
                    className="px-3 py-1 border rounded-md"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rate list / Download */}
        <section id="rates" className="my-8">
          <h3 className="text-2xl font-semibold mb-3">Rate List</h3>
          <p className="text-sm text-gray-600">Download our full rate list (PDF). For bulk or corporate packages, contact us for custom pricing.</p>

          <div className="mt-4">
            <a href="/files/Bagree%20diagnostic%20centre%20Rate%20list_2.pdf" download className="px-4 py-2 bg-green-600 text-white rounded-md">Download Rate List (PDF)</a>
          </div>
        </section>

        {/* Booking form */}
        <section id="book" className="my-8 bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-2xl font-semibold mb-4">Book an Appointment / Home Collection</h3>

          <form onSubmit={submitBooking} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="p-2 border rounded-md"
              placeholder="Patient name"
              value={booking.name}
              onChange={(e) => setBooking({ ...booking, name: e.target.value })}
            />

            <input
              className="p-2 border rounded-md"
              placeholder="Phone (10 digits)"
              value={booking.phone}
              onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
            />

            <input
              className="p-2 border rounded-md"
              placeholder="Email (optional)"
              value={booking.email}
              onChange={(e) => setBooking({ ...booking, email: e.target.value })}
            />

            <input
              type="date"
              className="p-2 border rounded-md"
              value={booking.date}
              onChange={(e) => setBooking({ ...booking, date: e.target.value })}
            />

            <input
              type="time"
              className="p-2 border rounded-md"
              value={booking.time}
              onChange={(e) => setBooking({ ...booking, time: e.target.value })}
            />

            <select
              className="p-2 border rounded-md"
              value={booking.test}
              onChange={(e) => setBooking({ ...booking, test: e.target.value })}
            >
              <option value="">Select test / sample type</option>
              {servicesSample.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            <div className="md:col-span-2 flex gap-3 items-center">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Confirm Booking</button>
              <div className="text-sm text-gray-600">{message}</div>
            </div>
          </form>
        </section>

        {/* Reports */}
        <section id="reports" className="my-8">
          <h3 className="text-2xl font-semibold mb-3">Reports &amp; Uploads</h3>
          <p className="text-sm text-gray-600">Patients can download reports using their mobile and reference ID. Laboratories can upload completed reports (PDF) to the patient record.</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium">Patient — Download Report</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("This demo needs backend to fetch a report.");
                }}
                className="mt-3 flex gap-2"
              >
                <input placeholder="Reference ID" className="p-2 border rounded-md" />
                <button className="px-3 py-2 border rounded-md">Get Report</button>
              </form>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium">Lab — Upload Report (PDF)</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("This demo requires authenticated backend for uploads.");
                }}
                className="mt-3 grid gap-2"
              >
                <input type="file" accept="application/pdf" />
                <input placeholder="Reference ID" className="p-2 border rounded-md" />
                <button className="px-3 py-2 bg-gray-800 text-white rounded-md">Upload</button>
                <div className="text-xs text-gray-500">Files should be &lt;= 10MB. Store on secure S3 / blob storage and serve with expiring links.</div>
              </form>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="my-8 bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-2xl font-semibold mb-4">Contact &amp; Location</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-700">Bagree Diagnostic Centre<br />Opp. XYZ, Main Road<br />City, State — PIN</p>
              <p className="mt-3 text-sm">Phone: <a href="tel:+911234567890" className="text-blue-600">+91 12345 67890</a></p>
              <p className="text-sm">Email: <a href="mailto:info@bagreedx.com" className="text-blue-600">info@bagreedx.com</a></p>
            </div>

            <div>
              <iframe title="map" src="https://www.google.com/maps?q=india&output=embed" className="w-full h-40 rounded-md border-0"></iframe>
            </div>
          </div>
        </section>

        <footer className="py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Bagree Diagnostic Centre — All rights reserved.
        </footer>
      </main>
    </div>
  );
}
