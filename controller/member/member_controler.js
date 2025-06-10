const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');

const {
  createMemberService,
  updateMemberService,
  deleteMemberService,
  getAllMembersService,
  filterMemberByJoinDateService,
  filterMemberByPointsService,
  filterMemberByTierService,
  getMembersByOutletIdService,
  searchMemberService,
  searchAllMemberService
} = require('../../service/member/member_service');

// CREATE MEMBER
const createMemberController = catchAsync(async (req, res) => {
  const { userId, outletId, membershipLevel, membershipDuration } = req.body;
  console.log(`body : ${JSON.stringify(req.body)}`);
  const newMember = await createMemberService(userId, outletId, membershipLevel, membershipDuration);
  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Member successfully created',
    data: newMember
  });
});

// GET ALL MEMBERS
const getAllMembersController = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const data = await getAllMembersService(page, limit);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All members retrieved successfully',
    data: data
  });
});

// DELETE MEMBER
const deleteMemberController = catchAsync(async (req, res) => {
  const { id } = req.params;
  await deleteMemberService(id);
  res.status(StatusCodes.NO_CONTENT).json({
    status: true,
    message: 'Member successfully deleted',
    data: null
  });
});

// UPDATE MEMBER
const updateMemberController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { membershipLevel, membershipDuration } = req.body;


  const updatedMember = await updateMemberService(id, 
    membershipLevel ,
    membershipDuration
  );

  if (!updatedMember) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Member not found',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Member successfully updated',
    data: updatedMember
  });
});

// GET MEMBERS BY OUTLET
const getAllMembersByOutletController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const data = await getMembersByOutletIdService(outletId, parseInt(page), parseInt(limit));
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All members retrieved successfully',
    data: data
  });
});

// SEARCH MEMBERS BY OUTLET
const searchAllMembersByOutletController = catchAsync(async (req, res) => {
  const { searchTerm = '', page = 1, limit = 5 } = req.query;
  const { outletId } = req.params;

  if (!outletId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: 'Parameter outletId wajib diisi.'
    });
  }

  const result = await searchMemberService(searchTerm, outletId, parseInt(page), parseInt(limit));
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Pencarian member berhasil.',
    data: result
  });
});

// FILTER MEMBERS BY JOIN DATE
const filterMemberByJoinDateController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const { sort = 'desc', page = 1, limit = 5 } = req.query;

  const result = await filterMemberByJoinDateService(
    outletId,
    sort,
    parseInt(page),
    parseInt(limit)
  );

  res.status(StatusCodes.OK).json({
    status: true,
    message: `Members filtered by join date (${sort} order)`,
    data: result
  });
});

// FILTER MEMBERS BY POINTS
const filterMemberByPointsController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const { sort = 'desc', page = 1, limit = 5 } = req.query;

  const result = await filterMemberByPointsService(
    outletId,
    sort,
    parseInt(page),
    parseInt(limit)
  );

  res.status(StatusCodes.OK).json({
    status: true,
    message: `Members filtered by points (${sort} order)`,
    data: result
  });
});

// FILTER MEMBERS BY TIER
const filterMemberByTierController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const { page = 1, limit = 5 } = req.query;

  const result = await filterMemberByTierService(
    outletId,
    parseInt(page),
    parseInt(limit)
  );

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Members filtered by highest tier',
    data: result
  });
});

const searchAllMembersController = catchAsync(async (req, res) => {
  const { searchTerm = '', page = 1, limit = 5 } = req.query;




  const result = await searchAllMemberService(searchTerm, parseInt(page), parseInt(limit));
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Pencarian member berhasil.',
    data: result
  });
});

module.exports = {
  createMemberController,
  getAllMembersController,
  deleteMemberController,
  updateMemberController,
  getAllMembersByOutletController,
  searchAllMembersByOutletController,
  filterMemberByJoinDateController,
  filterMemberByPointsController,
  filterMemberByTierController,
  searchAllMembersController
};
