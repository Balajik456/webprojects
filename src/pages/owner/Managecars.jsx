import React, { useEffect, useState } from "react";
import Title from "../../components/owner/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/Appcontext";
import toast from "react-hot-toast";

const Managecars = () => {
  const { isOwner, axios, currency } = useAppContext();
  const [cars, setCars] = useState([]);

  const fetchOwnerCars = async () => {
    try {
      const { data } = await axios.get("/api/owner/cars");
      if (data.success) setCars(data.cars);
      else toast.error(data.message);
    } catch {
      toast.error("Failed to fetch cars");
    }
  };
  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post("/api/owner/toggle-car", { carId });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerCars();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(error.message);
    }
  };
const deleteCar = async (carId) => {
  try {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this car?"
    );
    if (!confirmDelete) return;

    const { data } = await axios.post("/api/owner/delete-car", {
      carId,
    });

    if (data.success) {
      toast.success(data.message);
      fetchOwnerCars();
    } else {
      toast.error(data.message || "Delete failed");
    }
  } catch (error) {
    console.error("DELETE ERROR:", error.response?.data || error.message);
    toast.error("Delete failed");
  }
};




  useEffect(() => {
    if (isOwner) fetchOwnerCars();
  }, [isOwner]);

  return (
    <div className="px-4 pt-10 md:px-10 w-full">
      <Title
        title="Manage Cars"
        subTitle="View all listed cars and manage availability"
      />

      <div className="max-w-4xl w-full rounded-md overflow-hidden border mt-6">
        <table className="w-full text-sm text-gray-600">
          <thead>
            <tr>
              <th className="p-3 ">Car</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price Per Day</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car._id} className="border-t">
                {/* Car Details */}
                <td className="p-3 flex gap-3">
                  <img
                    src={car.image}
                    alt={car.model}
                    className="h-12 w-12 rounded"
                  />
                  <div>
                    <p>
                      {car.brand} {car.model}
                    </p>
                    <p className="text-xs">
                      {car.seating_capacity} • {car.transmission}
                    </p>
                  </div>
                </td>

                {/* Category */}
                <td className="p-3">{car.category}</td>

                {/* Price Per Day */}
                <td className="p-3">
                  {currency} {car.priceperday}
                </td>

                {/* Status */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      car.isAvailable
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {car.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3 flex gap-2">
                  <img
                    onClick={() => toggleAvailability(car._id)}
                    src={
                      car.isAvailable ? assets.eye_icon : assets.eye_close_icon
                    }
                    className="cursor-pointer"
                    title="Toggle Availability"
                  />
                  <img
                    onClick={() => deleteCar(car._id)}
                    src={assets.delete_icon}
                    className="cursor-pointer"
                    title="Delete Car"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cars.length === 0 && (
          <p className="text-center text-gray-400 py-4">No cars listed yet</p>
        )}
      </div>
    </div>
  );
};

export default Managecars;
