const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  getAllOutletsServices,
  getOutletByNameService,
  getOutletsByLocationServices,
  updateOutletService,
  deleteOutletService,
  createOutletService,
  getAllListOutlesServices ,

} = require('../../service/outlet/outlet_service');
const { formatImageToBase64 } = require('../../utils/func');

const createOutletController = catchAsync(async (req, res) => {
  const { name, address, lat, long, openingTime, closingTime, contactNumber, openingDays } = req.body;
  const image = req.files?.image;

  let formattedImage = null;
  if (image) {
    formattedImage = formatImageToBase64(image);
  }

  const newOutlet = await createOutletService({
    name,
    address,
    lat,
    long,
    openingDays,
    openingTime,
    closingTime,
    contactNumber,
    image: formattedImage,
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Outlet successfully created',
    data: newOutlet,
  });
});

const getOutletByNameController = catchAsync(async (req, res) => {
  const { name } = req.params;
  const outlet = await getOutletByNameService(name);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Outlet retrieved successfully',
    data: outlet
  });
});

const getOutletsByLocationController = catchAsync(async (req, res) => {
  const { location } = req.query;
  const outlets = await getOutletsByLocationServices(location);
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

const getAllOutletsController = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const outlets = await getAllOutletsServices(page, limit);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All outlets retrieved successfully',
    data: outlets
  });
});

const deleteOutletController = catchAsync(async (req, res) => {
  const { id } = req.params;
  await deleteOutletService(id);
  res.status(StatusCodes.NO_CONTENT).send();  // 204 No Content, no body
});

const updateOutletController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, address, lat, long, openingTime, closingTime, contactNumber, openingDays } = req.body;
  const image = req.files?.image;

  let formattedImage = null;
  if (image) {
    formattedImage = formatImageToBase64(image);
  }

  const updateData = {
    name,
    location: { address, lat, long },
    openingDays,
    openingTime,
    closingTime,
    phone: contactNumber,
    image: formattedImage,
  };

  const updatedOutlet = await updateOutletService(id, updateData);

  if (!updatedOutlet) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Outlet not found',
      data: null,
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Outlet successfully updated',
    data: updatedOutlet,
  });
});

const getAllListOutletController = catchAsync(async (req, res) => {
  const data = await getAllListOutlesServices();

  if (data.length === 0) {
    return res.status(StatusCodes.OK).json({
      status: true,
      message: 'No outlets found.',
      data: []
    });
  }

  return res.status(StatusCodes.OK).json({
    status: true,
    message: 'Outlets fetched successfully.',
    data: data
  });
});

module.exports = {
  createOutletController,
  getOutletByNameController,
  getOutletsByLocationController,
  getAllOutletsController,
  deleteOutletController,
  updateOutletController,
  getAllListOutletController
};
