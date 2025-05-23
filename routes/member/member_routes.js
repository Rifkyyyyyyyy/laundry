const express = require("express");
const router = express.Router();

const {
    getMemberByUserIdController,
    getMemberByIdController,
    createMemberController,
    deleteMemberController,
    getAllMembersController,
    updateMemberController,
    validateMemberStatusController,
    getActiveMembersController,
    getAllMembersByOutletController,
    searchAllMembersByOutletController,
    filterMemberByJoinDateController,
    filterMemberByPointsController,
    filterMemberByTierController
} = require('../../controller/member/member_controler');

// [POST] /member - Tambah member baru
router.post("/member", createMemberController);

// [GET] /member - Ambil semua member
router.get("/member", getAllMembersController);

// [GET] /member/search/:outletId - Cari member berdasarkan outletId
router.get("/member/search/:outletId", searchAllMembersByOutletController);

// [GET] /member/active - Ambil semua member aktif
router.get("/member/active", getActiveMembersController);

// [GET] /member/userId/:userId - Ambil member berdasarkan userId
router.get("/member/userId/:userId", getMemberByUserIdController);

// [GET] /member/:id - Ambil member berdasarkan ID
router.get("/member/:id", getMemberByIdController);

// [PATCH] /member/:id - Update member berdasarkan ID
router.patch("/member/:id", updateMemberController);

// [DELETE] /member/:id - Hapus member berdasarkan ID
router.delete("/member/:id", deleteMemberController);

// [POST] /member/validate - Validasi status member (via body)
router.post("/member/validate", validateMemberStatusController);

// [GET] /member/outlet/:outletId - Ambil semua member berdasarkan outletId
router.get("/member/outlet/:outletId", getAllMembersByOutletController);

// [GET] /member/filter/join-date/:outletId - Filter member berdasarkan tanggal join
router.get("/member/filter/join-date/:outletId", filterMemberByJoinDateController);

// [GET] /member/filter/points/:outletId - Filter member berdasarkan poin
router.get("/member/filter/points/:outletId", filterMemberByPointsController);

// [GET] /member/filter/tier/:outletId - Filter member berdasarkan tier tertinggi
router.get("/member/filter/tier/:outletId", filterMemberByTierController);

module.exports = router;