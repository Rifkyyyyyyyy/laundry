const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Outlet = require('../../model/outlet/outlet');

// CREATE NEW OUTLET
const createOutlet = async (data) => {
  const existingOutlet = await Outlet.findOne({ name: data.name });
  if (existingOutlet) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Outlet dengan nama ini sudah ada');
  }

  const newOutlet = new Outlet(data);
  await newOutlet.save();
  
  return newOutlet;
};

// GET ALL OUTLETS
const getAllOutlets = async () => {
  return await Outlet.find();
};

// GET OUTLET BY ID
const getOutletById = async (id) => {
  const outlet = await Outlet.findById(id);
  if (!outlet) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Outlet tidak ditemukan');
  return outlet;
};

// UPDATE OUTLET BY ID
const updateOutlet = async (id, data) => {
  const updatedOutlet = await Outlet.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updatedOutlet) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Outlet tidak ditemukan untuk diperbarui');
  }
  return updatedOutlet;
};

// DELETE OUTLET BY ID
const deleteOutlet = async (id) => {
  const deletedOutlet = await Outlet.findByIdAndDelete(id);
  if (!deletedOutlet) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Outlet tidak ditemukan');
  }
  return deletedOutlet;
};

// GET OUTLETS BY LOCATION (optional filtering by city or address)
const getOutletsByLocation = async (city) => {
  return await Outlet.find({ city });
};

// GET OUTLET BY NAME (for search)
const getOutletByName = async (name) => {
  const outlet = await Outlet.findOne({ name });
  if (!outlet) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Outlet tidak ditemukan');
  return outlet;
};

module.exports = {
  createOutlet,
  getAllOutlets,
  getOutletById,
  updateOutlet,
  deleteOutlet,
  getOutletsByLocation,
  getOutletByName
};
