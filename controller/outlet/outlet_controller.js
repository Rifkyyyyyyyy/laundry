const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  getOutletById,
  getOutletByName,
  getOutletsByLocation,
  createOutlet,
  deleteOutlet,
  getAllOutlets,
  updateOutlet
} = require('../../service/outlet/outlet_service');

// CREATE OUTLET
const createOutletController = catchAsync(async (req, res) => {
  console.log(req.body);  // Periksa data yang diterima

  const { name, address, openingTime, closingTime, contactNumber } = req.body;

  const newOutlet = await createOutlet({ name, address, openingTime, closingTime, contactNumber });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Outlet successfully created',
    data: newOutlet
  });
});

// GET OUTLET BY ID
const getOutletByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const outlet = await getOutletById(id);
  if (!outlet) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Outlet not found',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Outlet retrieved successfully',
    data: outlet
  });
});

// GET OUTLET BY NAME
const getOutletByNameController = catchAsync(async (req, res) => {
  const { name } = req.params;
  const outlet = await getOutletByName(name);
  if (!outlet) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Outlet not found',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Outlet retrieved successfully',
    data: outlet
  });
});

// GET OUTLETS BY LOCATION
const getOutletsByLocationController = catchAsync(async (req, res) => {
  const { location } = req.query;
  const outlets = await getOutletsByLocation(location);
  if (outlets.length === 0) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'No outlets found in this location',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Outlets in the location retrieved successfully',
    data: outlets
  });
});

// GET ALL OUTLETS
const getAllOutletsController = catchAsync(async (req, res) => {
  const outlets = await getAllOutlets();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All outlets retrieved successfully',
    data: outlets
  });
});

// DELETE OUTLET
const deleteOutletController = catchAsync(async (req, res) => {
  const { id } = req.params;
  await deleteOutlet(id);
  res.status(StatusCodes.NO_CONTENT).json({
    status: true,
    message: 'Outlet successfully deleted',
    data: null
  });
});

// UPDATE OUTLET
const updateOutletController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, location, contactNumber, openingHours } = req.body;

  const updatedOutlet = await updateOutlet(id, { name, location, contactNumber, openingHours });

  if (!updatedOutlet) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Outlet not found',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Outlet successfully updated',
    data: updatedOutlet
  });
});

module.exports = {
  createOutletController,
  getOutletByIdController,
  getOutletByNameController,
  getOutletsByLocationController,
  getAllOutletsController,
  deleteOutletController,
  updateOutletController
};
