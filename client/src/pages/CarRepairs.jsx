import React, { useState } from "react";
import { Car, Wrench, Calendar } from "lucide-react";

const CarRepairs = () => {
  const [repairs, setRepairs] = useState([
    {
      id: 1,
      car: "BMW X5",
      issue: "Engine oil change",
      date: "2025-12-01",
      cost: "₹3,000",
      status: "Completed",
    },
    {
      id: 2,
      car: "Audi A4",
      issue: "Brake replacement",
      date: "2025-12-15",
      cost: "₹8,500",
      status: "Pending",
    },
    {
      id: 3,
      car: "BMW X5",
      issue: "Engine oil change",
      date: "2025-12-01",
      cost: "₹3,000",
      status: "Completed",
    },
    {
      id: 4,
      car: "Audi A4",
      issue: "Brake replacement",
      date: "2025-12-15",
      cost: "₹8,500",
      status: "Pending",
    },
  ]);

  const [car, setCar] = useState("");
  const [issue, setIssue] = useState("");
  const [date, setDate] = useState("");

  const handleAddRepair = (e) => {
    e.preventDefault();
    setRepairs([
      ...repairs,
      {
        id: Date.now(),
        car,
        issue,
        date,
        cost: "₹0",
        status: "Pending",
      },
    ]);
    setCar("");
    setIssue("");
    setDate("");
  };

  return (
    <div className="px-70 py-10">
      {/* 🔹 Banner */}
      <div className="  p-6 mb-12 flex items-center justify-center gap-10">
        {/* SMALL IMAGE */}
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZyxBPeGa0e_ViEUtLwxe-_RsgJEQxkBx09w&s"
          alt="repair"
        />

        <h1 className="text-3xl font-semibold text-white flex items-center gap-2"></h1>
      </div>

      {/* 🔹 Form */}
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md mx-auto mb-16">
        <h2 className="text-xl font-semibold text-indigo-500 mb-6">
          Add Repair Details
        </h2>

        <form onSubmit={handleAddRepair} className="space-y-4">
          <input
            value={car}
            onChange={(e) => setCar(e.target.value)}
            placeholder="Car Model"
            className="w-full border rounded p-2"
            required
          />
          <input
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            placeholder="Repair Issue"
            className="w-full border rounded p-2"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded p-2"
            required
          />

          {/* BUTTON SPACE */}
          <button className="w-full bg-indigo-500 text-white py-2 rounded-lg mt-6">
            Add Repair
          </button>
        </form>
      </div>

      {/* 🔹 CENTERED CAR REPAIR CARDS */}
      {/* 🔹 CENTERED CAR REPAIR CARDS */}
      <div className="flex justify-center mt-4 mb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-25">
          {repairs.map((r) => (
            <div
              key={r.id}
              className="bg-white p-6 rounded-xl shadow-md w-[360px]"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Car className="text-indigo-500" /> {r.car}
              </h3>

              <p className="mt-2 flex items-center gap-2 text-gray-600">
                <Wrench size={16} /> {r.issue}
              </p>

              <p className="mt-2 flex items-center gap-2 text-gray-600">
                <Calendar size={16} /> {r.date}
              </p>

              <p className="mt-2 text-gray-700">
                Cost: <span className="font-medium">{r.cost}</span>
              </p>

              <p className="mt-1">
                Status:{" "}
                <span
                  className={
                    r.status === "Completed"
                      ? "text-green-600 font-medium"
                      : "text-orange-500 font-medium"
                  }
                >
                  {r.status}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarRepairs;
