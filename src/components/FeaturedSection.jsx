import React from "react";
import Title from "./Title";
import { assets } from "../assets/assets";
import CarCard from "./CarCard";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/Appcontext";
import { motion } from "motion/react";

const FeaturedSection = () => {
  const navigate = useNavigate();
  const { cars } = useAppContext();

  // ✅ FIXED: Safety check prevents the .slice crash
  const featuredCars = cars && Array.isArray(cars) ? cars.slice(0, 6) : [];

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex flex-col items-center py-24 px-6 md:px-16 lg:px-24 xl:px-32"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Title
          title="Featured Vehicles"
          subTitle="Explore our selection of premium vehicles available for your next adventure"
        />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18 w-full">
        {featuredCars.length > 0 ? (
          featuredCars.map((car, index) => (
            <motion.div
              key={car._id}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CarCard car={car} />
            </motion.div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400 italic py-10">
            Fetching available cars...
          </p>
        )}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        onClick={() => {
          navigate("/cars");
          window.scrollTo(0, 0);
        }}
        className="flex items-center justify-center gap-2 px-8 py-3 border border-gray-300 hover:bg-gray-50 rounded-full mt-18 transition-all cursor-pointer font-medium text-gray-600"
      >
        Explore all cars{" "}
        <img src={assets.arrow_icon} alt="arrow" className="w-3" />
      </motion.button>
    </motion.div>
  );
};

export default FeaturedSection;
