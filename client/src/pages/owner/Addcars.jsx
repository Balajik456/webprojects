import React, { useState } from 'react'
import Title from '../../components/owner/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/Appcontext'
import toast from 'react-hot-toast'

const Addcars = () => {
  const { axios, currency } = useAppContext();

  const [image,setImage] = useState(null)
  const [car,setCar] = useState({
    brand:'',
    model:'',
    year:'',
    priceperday:'',
    category:'',
    transmission:'',
    fuel_type:'',
    seat_capacity:'',
    location:'',
    description:'',
  })
  const [isLoading,setIsLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!image) {
      toast.error("Please upload a car image");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("carData", JSON.stringify(car));

      const { data } = await axios.post("/api/owner/add-car", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });;

      if (data.success) {
        toast.success(data.message);

        setImage(null);
        setCar({
          brand: "",
          model: "",
          year: "",
          priceperday: "",
          category: "",
          transmission: "",
          fuel_type: "",
          seat_capacity: "",
          location: "",
          description: "",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-10 md:px-10 flex-1">
      <Title
        title="Add new Cars"
        subTitle="Fill in the details to list new cars for booking ,including pricing,availability and car specification"
      />
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl"
      >
        {/*car image */}
        <div className="flex items-center gap-2 w-full">
          <label htmlFor="car-image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_icon}
              alt=""
              className="h-14 rounded cursor-pointer"
            />
            <input
              type="file"
              id="car-image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
          <p className="text-sm text-gray-500">
            Uploaded the picture of your cars
          </p>
        </div>
        {/*car brand and model*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col w-full">
            <label>Brand</label>
            <input
              type="text"
              placeholder="e.g BMW, Audi"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={car.brand}
              onChange={(e) => setCar({ ...car, brand: e.target.value })}
            ></input>
          </div>
          <div className="flex flex-col w-full">
            <label>Model</label>
            <input
              type="text"
              placeholder="e.g E4, X5"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={car.model}
              onChange={(e) => setCar({ ...car, model: e.target.value })}
            ></input>
          </div>
        </div>
        {/*car year and price,cateagory*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col w-full">
            <label>Year</label>
            <input
              type="number"
              placeholder="2025"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={car.year}
              onChange={(e) => setCar({ ...car, year: e.target.value })}
            ></input>
          </div>
          <div className="flex flex-col w-full">
            <label>Daily price({currency})</label>
            <input
              type="number"
              placeholder="100"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={car.priceperday}
              onChange={(e) => setCar({ ...car, priceperday: e.target.value })}
            ></input>
          </div>
          <div className="flex flex-col w-full">
            <label>category</label>
            <select
              onChange={(e) => setCar({ ...car, category: e.target.value })}
              value={car.category}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">select the category</option>
              <option value="sedan">sedan</option>
              <option value="Suv">Suv</option>
              <option value="Van">Van</option>
            </select>
          </div>
        </div>
        {/*car Transmission and fuel type,seat capacity*/}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex flex-col w-full">
            <label>Transmission</label>
            <select
              onChange={(e) => setCar({ ...car, transmission: e.target.value })}
              value={car.transmission}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">select the transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label>Fuel Type</label>
            <select
              onChange={(e) => setCar({ ...car, fuel_type: e.target.value })}
              value={car.fuel_type}
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            >
              <option value="">select the Fuel Type</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Gas">Gas</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label>Seating Capacity</label>
            <input
              type="number"
              placeholder="eg..2,3,4"
              required
              className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
              value={car.seat_capacity}
              onChange={(e) =>
                setCar({ ...car, seat_capacity: e.target.value })
              }
            ></input>
          </div>
        </div>
        {/*car location*/}
        <div className="flex flex-col w-full">
          <label>Location</label>
          <select
            required
            onChange={(e) => setCar({ ...car, location: e.target.value })}
            value={car.location}
            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
          >
            <option value="">Select the Location</option>
            <option value="Chennai">Chennai</option>
            <option value="Ooty">Ooty</option>
            <option value="Vellore">Vellore</option>
            <option value="Kerala">Kerala</option>
            <option value="Pune">Pune</option>
          </select>
        </div>
        {/* car description */}
        <div className="flex flex-col w-full">
          <label>Description</label>
          <textarea
            rows={5}
            placeholder="Feedback about your cars"
            required
            className="px-3 py-2 mt-1 border border-borderColor rounded-md outline-none"
            value={car.description}
            onChange={(e) => setCar({ ...car, description: e.target.value })}
          ></textarea>
        </div>
        <button className=" flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer">
          <img src={assets.tick_icon} alt="" />
          {isLoading ? "Listing..." : "List Your cars"}
        </button>
      </form>
    </div>
  );
}

export default Addcars
