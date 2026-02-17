// import React, { useState } from "react";
// import Title from "../components/Title";
// import { assets, dummyCarData } from "../assets/assets";
// import CarCard from "../components/CarCard";

// const Cars = () => {
//   const [input, setInput] = useState("");

//   const filteredCars = dummyCarData.filter((car) =>
//     car.name.toLowerCase().includes(input.toLowerCase())
//   );

//   return (
//     <div>
//       <div className="flex flex-col items-center py-20 bg-light max-md:px-4">
//         <Title
//           title="Available Cars"
//           subTitle="Browse our selection of premium vehicles available for your next adventure"
//         />

//         <div className="flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow">
//           <img src={assets.search_icon} alt="" className="w-4.5 h-4.5 mr-2" />
//           <input
//             onChange={(e) => setInput(e.target.value)}
//             value={input}
//             type="text"
//             placeholder="Search by make, model, or features"
//             className="w-full h-full outline-none text-gray-500"
//           />
//           <img src={assets.filter_icon} alt="" className="w-4.5 h-4.5 ml-2" />
//         </div>
//       </div>

//       <div className="px-6 md:px-6 lg:px-24 xl:px-32 mt-10">
//         <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto">
//           Showing {filteredCars.length} Cars
//         </p>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto">
//           {filteredCars.map((car, index) => (
//             <CarCard key={index} car={car} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cars;

import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CarCard from "../components/CarCard";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/Appcontext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Cars = () => {
  const [searchParams] = useSearchParams();
  const locationParam = searchParams.get("location");
  const pickupDate = searchParams.get("pickup");
  const returnDate = searchParams.get("return");

  const { axios } = useAppContext();

  const [input, setInput] = useState("");
  const [baseCars, setBaseCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Logic: If search params exist, run a filtered search; otherwise, fetch all cars
    if (locationParam && pickupDate && returnDate) {
      searchCarAvailability();
    } else {
      fetchAllCars();
    }
  }, [locationParam, pickupDate, returnDate]);

  // 🔹 Fetch all cars for general browsing
  const fetchAllCars = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/car/list");
      if (data.success) {
        setBaseCars(data.cars);
        setFilteredCars(data.cars);
      }
    } catch (err) {
      toast.error("Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch cars filtered by availability
  const searchCarAvailability = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/bookings/available-cars", {
        params: {
          pickupLocation: locationParam,
          pickupDate,
          returnDate,
        },
      });

      if (data.success) {
        setBaseCars(data.cars);
        setFilteredCars(data.cars);
        if (data.cars.length === 0) {
          toast(`No cars available in ${locationParam} 🚗`);
        }
      }
    } catch (err) {
      toast.error("Search error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Client-side live filter for the search bar
  useEffect(() => {
    if (!input) {
      setFilteredCars(baseCars);
      return;
    }
    const filtered = baseCars.filter(
      (car) =>
        car.brand.toLowerCase().includes(input.toLowerCase()) ||
        car.model.toLowerCase().includes(input.toLowerCase()),
    );
    setFilteredCars(filtered);
  }, [input, baseCars]);

  return (
    <div className="pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-20 bg-gray-50 flex flex-col items-center"
      >
        <Title
          title="Available Cars"
          subTitle="Browse our premium rental fleet"
        />
        <div className="flex items-center bg-white px-4 mt-6 max-w-md w-full h-12 rounded-full shadow-sm border">
          <img src={assets.search_icon} className="w-4 h-4 mr-2" alt="search" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by brand or model..."
            className="w-full outline-none text-sm"
          />
        </div>
      </motion.div>

      <div className="px-6 lg:px-24 mt-10">
        <p className="text-xs text-gray-400 font-bold mb-6 tracking-widest uppercase">
          {loading
            ? "Refreshing..."
            : `Showing ${filteredCars.length} Vehicles`}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>

        {!loading && filteredCars.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 italic">
              No vehicles found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cars;