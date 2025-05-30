const express = require("express");
const router = express.Router();

const {
    createMemberController,
    deleteMemberController,
    updateMemberController,
    getAllMembersByOutletController,
    getAllMembersController,
    filterMemberByJoinDateController,
    filterMemberByPointsController,
    filterMemberByTierController,
    searchAllMembersByOutletController,
} = require('../../controller/member/member_controler');

// [POST] /member - Tambah member baru
router.post("/member", createMemberController);

// [GET] /member - Ambil semua member
router.get("/member", getAllMembersController);

// [GET] /member/search/:outletId - Cari member berdasarkan outletId
router.get("/member/search/:outletId", searchAllMembersByOutletController);


// [PATCH] /member/:id - Update member berdasarkan ID
router.patch("/member/:id", updateMemberController);

// [DELETE] /member/:id - Hapus member berdasarkan ID
router.delete("/member/:id", deleteMemberController);

// [GET] /member/outlet/:outletId - Ambil semua member berdasarkan outletId
router.get("/member/outlet/:outletId", getAllMembersByOutletController);

// [GET] /member/filter/join-date/:outletId - Filter member berdasarkan tanggal join
router.get("/member/filter/join-date/:outletId", filterMemberByJoinDateController);

// [GET] /member/filter/points/:outletId - Filter member berdasarkan poin
router.get("/member/filter/points/:outletId", filterMemberByPointsController);

// [GET] /member/filter/tier/:outletId - Filter member berdasarkan tier tertinggi
router.get("/member/filter/tier/:outletId", filterMemberByTierController);

module.exports = router;
