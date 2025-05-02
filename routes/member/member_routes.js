const express = require("express");
const router = express.Router();

const {
    getMemberByEmailController,
    getMemberByIdController,
    createMemberController,
    deleteMemberController,
    getAllMembersController,
    updateMemberController,
    validateMemberStatusController,
    getActiveMembersController
} = require('../../controller/member/member_controler');

// [POST] /member - Tambah member baru
router.post("/member", createMemberController);

// [GET] /member - Ambil semua member
router.get("/member", getAllMembersController);

// [GET] /member/active - Ambil semua member aktif
router.get("/member/active", getActiveMembersController);

// [GET] /member/email/:email - Ambil member berdasarkan email
router.get("/member/email/:email", getMemberByEmailController);

// [GET] /member/:id - Ambil member berdasarkan ID
router.get("/member/:id", getMemberByIdController);

// [PATCH] /member/:id - Update member berdasarkan ID
router.patch("/member/:id", updateMemberController);

// [DELETE] /member/:id - Hapus member berdasarkan ID
router.delete("/member/:id", deleteMemberController);

// [POST] /member/validate - Validasi status member (via body)
router.post("/member/validate", validateMemberStatusController);

module.exports = router;
