const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Member = require('../../model/member/member');

// CREATE NEW MEMBER
const createMember = async (data) => {
  // Cek apakah email sudah terdaftar
  const existingMember = await Member.findOne({ email: data.email });
  if (existingMember) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Email sudah terdaftar');
  }

  // Membuat member baru
  const newMember = new Member(data);
  await newMember.save();
  
  return newMember;
};

// GET ALL MEMBERS
const getAllMembers = async () => {
  return await Member.find();
};

// GET MEMBER BY ID
const getMemberById = async (id) => {
  const member = await Member.findById(id);
  if (!member) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan');
  return member;
};

// UPDATE MEMBER BY ID
const updateMember = async (id, data) => {
  const updatedMember = await Member.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updatedMember) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan untuk diperbarui');
  }
  return updatedMember;
};

// DELETE MEMBER BY ID
const deleteMember = async (id) => {
  const deletedMember = await Member.findByIdAndDelete(id);
  if (!deletedMember) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan');
  }
  return deletedMember;
};

// GET ACTIVE MEMBERS
const getActiveMembers = async () => {
  return await Member.find({ isActive: true });
};

// GET MEMBER BY EMAIL
const getMemberByEmail = async (email) => {
  const member = await Member.findOne({ email });
  if (!member) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan');
  return member;
};

// VALIDATE MEMBER STATUS
const validateMemberStatus = async (id) => {
  const member = await Member.findById(id);
  if (!member) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan');
  
  if (!member.isActive) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Member tidak aktif');
  }

  return member;
};

module.exports = {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getActiveMembers,
  getMemberByEmail,
  validateMemberStatus
};
