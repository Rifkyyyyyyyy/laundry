const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const memberService = require('../../service/member/member_service');

// CREATE MEMBER
const createMemberController = catchAsync(async (req, res) => {
  const { userId, outletId, membershipLevel, membershipDuration } = req.body;
  const newMember = await memberService.createMemberService(userId, outletId, membershipLevel, membershipDuration);
  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Member successfully created',
    data: newMember
  });
});

// GET MEMBER BY USER ID
const getMemberByUserIdController = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const member = await memberService.getMemberByUserIdService(userId);
  if (!member) return res.status(StatusCodes.NOT_FOUND).json({
    status: false,
    message: 'Member not found',
    data: null
  });
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Member retrieved successfully',
    data: member
  });
});

// GET MEMBER BY ID
const getMemberByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const member = await memberService.getMemberByIdService(id);
  if (!member) return res.status(StatusCodes.NOT_FOUND).json({
    status: false,
    message: 'Member not found',
    data: null
  });
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Member retrieved successfully',
    data: member
  });
});

// GET ALL MEMBERS
const getAllMembersController = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { members, pagination } = await memberService.getAllMembersService(page, limit);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All members retrieved successfully',
    data: { members, pagination }
  });
});

// GET ACTIVE MEMBERS
const getActiveMembersController = catchAsync(async (req, res) => {
  const members = await memberService.getActiveMembersService();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Active members retrieved successfully',
    data: members
  });
});

// DELETE MEMBER
const deleteMemberController = catchAsync(async (req, res) => {
  const { id } = req.params;
  await memberService.deleteMemberService(id);
  res.status(StatusCodes.NO_CONTENT).json({
    status: true,
    message: 'Member successfully deleted',
    data: null
  });
});

// UPDATE MEMBER
const updateMemberController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId, outletId, membershipLevel, name, phoneNumber, status } = req.body;
  const updatedMember = await memberService.updateMemberService(id, {
    userId,
    outletId,
    membershipLevel,
    name,
    phoneNumber,
    status
  });
  if (!updatedMember) return res.status(StatusCodes.NOT_FOUND).json({
    status: false,
    message: 'Member not found',
    data: null
  });
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Member successfully updated',
    data: updatedMember
  });
});

// VALIDATE MEMBER STATUS
const validateMemberStatusController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const memberStatus = await memberService.validateMemberStatusService(id);
  if (!memberStatus) return res.status(StatusCodes.NOT_FOUND).json({
    status: false,
    message: 'Member status not found',
    data: null
  });
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Member status validated successfully',
    data: memberStatus
  });
});

// GET ALL MEMBERS BY OUTLET
const getAllMembersByOutletController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const { members, pagination } = await memberService.getMembersByOutletIdService(outletId, page, limit);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All members retrieved successfully',
    data: { members, pagination }
  });
});

// SEARCH MEMBERS BY OUTLET
const searchAllMembersByOutletController = catchAsync(async (req, res) => {
  const { searchTerm = '', page = 1, limit = 5 } = req.query;
  const { outletId } = req.params;
  if (!outletId) return res.status(StatusCodes.BAD_REQUEST).json({
    status: false,
    message: 'Parameter outletId wajib diisi.'
  });
  const result = await memberService.searchMemberService(searchTerm, outletId, parseInt(page), parseInt(limit));
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Pencarian member berhasil.',
    data: result
  });
});

const filterMemberByJoinDateController = catchAsync(async (req, res) => {
  const { outletId } = req.params;
  const { sort = 'desc', page = 1, limit = 5 } = req.query;

  const result = await memberService.filterMemberByJoinDateService(
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

  const result = await memberService.filterMemberByPointsService(
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

  const result = await memberService.filterMemberByTierService(
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


module.exports = {
  createMemberController,
  getMemberByUserIdController,
  getMemberByIdController,
  getAllMembersController,
  getActiveMembersController,
  deleteMemberController,
  updateMemberController,
  validateMemberStatusController,
  getAllMembersByOutletController,
  searchAllMembersByOutletController,
  filterMemberByJoinDateController,
  filterMemberByPointsController,
  filterMemberByTierController
};