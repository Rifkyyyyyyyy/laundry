const catchAsync = require('../../utils/catchAsync');
const { StatusCodes } = require('http-status-codes');
const {
  getMemberByEmail,
  getMemberById,
  createMember,
  deleteMember,
  getAllMembers,
  updateMember,
  validateMemberStatus,
  getActiveMembers
} = require('../../service/member/member_service');

// CREATE MEMBER
const createMemberController = catchAsync(async (req, res) => {
  const { email, name, phoneNumber, status } = req.body; // Destructuring req.body

  const newMember = await createMember({ email, name, phoneNumber, status });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Member successfully created',
    data: newMember
  });
});

// GET MEMBER BY EMAIL
const getMemberByEmailController = catchAsync(async (req, res) => {
  const { email } = req.params;
  const member = await getMemberByEmail(email);
  if (!member) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Member not found',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Member retrieved successfully',
    data: member
  });
});

// GET MEMBER BY ID
const getMemberByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const member = await getMemberById(id);
  if (!member) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Member not found',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Member retrieved successfully',
    data: member
  });
});

// GET ALL MEMBERS
const getAllMembersController = catchAsync(async (req, res) => {
  const members = await getAllMembers();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'All members retrieved successfully',
    data: members
  });
});

// GET ACTIVE MEMBERS
const getActiveMembersController = catchAsync(async (req, res) => {
  const members = await getActiveMembers();
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Active members retrieved successfully',
    data: members
  });
});

// DELETE MEMBER
const deleteMemberController = catchAsync(async (req, res) => {
  const { id } = req.params;
  await deleteMember(id);
  res.status(StatusCodes.NO_CONTENT).json({
    status: true,
    message: 'Member successfully deleted',
    data: null
  });
});

// UPDATE MEMBER
const updateMemberController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { email, name, phoneNumber, status } = req.body;

  const updatedMember = await updateMember(id, { email, name, phoneNumber, status });

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

// VALIDATE MEMBER STATUS
const validateMemberStatusController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const memberStatus = await validateMemberStatus(id);
  if (!memberStatus) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: false,
      message: 'Member status not found',
      data: null
    });
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Member status validated successfully',
    data: memberStatus
  });
});

module.exports = {
  createMemberController,
  getMemberByEmailController,
  getMemberByIdController,
  getAllMembersController,
  getActiveMembersController,
  deleteMemberController,
  updateMemberController,
  validateMemberStatusController
};
