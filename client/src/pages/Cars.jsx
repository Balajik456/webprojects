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
import { motion } from "motion/react";

const Cars = () => {
  const [searchParams] = useSearchParams();

  const pickupLocation = searchParams.get("pickupLocation");
  const pickupDate = searchParams.get("pickupDate");
  const returnDate = searchParams.get("returnDate");

  const { axios } = useAppContext(); // removed 'cars' dependency to ensure fresh fetch

  const [input, setInput] = useState("");
  const [baseCars, setBaseCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 1. Main Logic: Decide what to fetch
  useEffect(() => {
    if (pickupLocation && pickupDate && returnDate) {
      // If URL has search data, run the specific availability search
      searchCarAvailability();
    } else {
      // If URL is empty (Navbar click), fetch ALL cars
      fetchAllCars();
    }
  }, [pickupLocation, pickupDate, returnDate]);

  // 🔹 Function to Fetch All Cars (For Browsing)
  const fetchAllCars = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/car/cars");
      if (data.success) {
        setBaseCars(data.cars);
        setFilteredCars(data.cars);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Function to Fetch Available Cars (For Searching)
  const searchCarAvailability = async () => {
    try {
      setLoading(true);
      console.log("Searching with:", {
        pickupLocation,
        pickupDate,
        returnDate,
      });

      const { data } = await axios.get("/api/bookings/available-cars", {
        params: {
          pickupLocation,
          pickupDate,
          returnDate,
        },
      });

      if (data.success) {
        setBaseCars(data.cars);
        setFilteredCars(data.cars);

        if (data.cars.length === 0) {
          toast("No cars available for these dates 🚗");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Text search filter (Client-side)
  useEffect(() => {
    if (!input) {
      setFilteredCars(baseCars);
      return;
    }

    const filtered = baseCars.filter(
      (car) =>
        car.brand.toLowerCase().includes(input.toLowerCase()) ||
        car.model.toLowerCase().includes(input.toLowerCase()) ||
        car.category.toLowerCase().includes(input.toLowerCase()) ||
        car.transmission.toLowerCase().includes(input.toLowerCase()),
    );

    setFilteredCars(filtered);
  }, [input, baseCars]);

  return (
    <div>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center py-20 bg-light"
      >
        <Title
          title="Available Cars"
          subTitle="Browse our selection of premium vehicles"
        />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow"
        >
          <img src={assets.search_icon} className="w-4.5 h-4.5 mr-2" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by brand, model..."
            className="w-full h-full outline-none text-gray-500"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{  opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="px-6 lg:px-24 xl:px-32 mt-10"
      >
        <p className="text-gray-500">
          {loading ? "Loading..." : `Showing ${filteredCars.length} Cars`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
          {loading ? (
            <div className="col-span-full text-center py-10">
              Loading cars...
            </div>
          ) : filteredCars.length > 0 ? (
            filteredCars.map((car) => <CarCard key={car._id} car={car} />)
          ) : (
            <p className="text-center col-span-full py-10">No cars found 🚗</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Cars;