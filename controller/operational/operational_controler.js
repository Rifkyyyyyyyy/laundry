const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');

const {
  createOperationalReports,
  getAllOperationalByOutletId,
  getAllOperationalReports,
  updateOperationalReports,
  filterFeedBackByNotResolved,
  markAsDownFeedback,
  answerFeedBackByOwner
} = require('../../service/operational/operational_services');

const { formatImageToBase64 } = require('../../utils/func');

const createReportController = catchAsync(async (req, res) => {
    const { outletId, createdBy, category, title, description } = req.body;
    const image = req.files?.image;
  
    let formattedImage = null;
    if (image) {
      formattedImage = formatImageToBase64(image);
    }

    console.log(`gambar : ${formattedImage}`)
  
    const result = await createOperationalReports({
      outletId,
      createdBy,
      category,
      title,
      description,
      image: formattedImage
    });
  
    res.status(StatusCodes.CREATED).json({
      status: true,
      message: 'Report successfully created',
      data: result
    });
  });
  

const getReportsByOutletController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const pageNum = Number(req.query.page) || 1;
  const limitNum = Number(req.query.limit) || 5;

  const result = await getAllOperationalByOutletId(outletId, pageNum, limitNum);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Reports by outlet fetched successfully',
    data: result
  });
});

const getAllReportsController = catchAsync(async (req, res) => {
  const pageNum = Number(req.query.page) || 1;
  const limitNum = Number(req.query.limit) || 5;

  const data = await getAllOperationalReports(pageNum, limitNum);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All reports fetched successfully',
    data
  });
});

const updateReportController = catchAsync(async (req, res) => {
    const { reportId } = req.params;
    const {
      outletId,
      category,
      title,
      description,
      isResolved
    } = req.body;
  
    const imageFile = req.file;
  
    let formattedImage = null;
    if (imageFile) {
      formattedImage = formatImageToBase64(imageFile);
    }
  
    const updateData = {
      outletId,
      category,
      title,
      description,
      isResolved,
      image: formattedImage,
    };
  
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
  
    const result = await updateOperationalReports(reportId, updateData);
  
    res.status(StatusCodes.OK).json({
      status: true,
      message: 'Report updated successfully',
      data: result
    });
  });

  
  
const addFeedbackController = catchAsync(async (req, res) => {
  const { reportId } = req.params;
  const { message , ownerId } = req.body;

  const result = await answerFeedBackByOwner({ reportId, ownerId, message });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Feedback sent successfully',
    data: result
  });
});

const resolveReportController = catchAsync(async (req, res) => {
  const { reportId } = req.params;

  const result = await markAsDownFeedback(reportId);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Report marked as resolved',
    data: result
  });
});

const getUnresolvedReportsController = catchAsync(async (req, res) => {
  const { outletId } = req.params;

  const result = await filterFeedBackByNotResolved(outletId);

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Unresolved reports fetched successfully',
    data: result
  });
});

module.exports = {
  createReportController,
  getReportsByOutletController,
  getAllReportsController,
  updateReportController,
  addFeedbackController,
  resolveReportController,
  getUnresolvedReportsController
};
