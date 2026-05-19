# KBLI Endpoints Refactor

**Date:** 2026-05-19

## Summary

Memisahkan KBLI matching logic dari endpoint `POST /api/users/business-profile` menjadi 2 endpoint terpisah untuk clarity dan better UX control.

---

## Changes

### **1. New Endpoints**

#### `POST /api/users/business-profile/kbli/recommend`
- **Purpose:** AI merekomendasikan KBLI berdasarkan `business_description`
- **Precondition:** 
  - `business_description` harus ada
  - `kbli_code` harus kosong
- **Response:**
  ```json
  {
    "status": "success",
    "message": "KBLI recommendation generated successfully",
    "data": {
      "kbli_code": "10791",
      "kbli_title": "Industri Makanan Lainnya",
      "confidence": 0.92,
      "explanation": "..."
    }
  }
  ```
- **Error:** 400 jika `kbli_code` sudah ada (harus pakai `/validate`)

#### `POST /api/users/business-profile/kbli/validate`
- **Purpose:** AI validasi apakah `kbli_code` yang ada cocok dengan `business_description`
- **Precondition:**
  - `kbli_code` dan `business_description` harus ada
- **Response:**
  ```json
  {
    "status": "success",
    "message": "KBLI validation completed successfully",
    "data": {
      "is_valid": true,
      "mismatch_alert": false,
      "explanation": "...",
      "suggested_kbli": "10791"  // optional, jika mismatch
    }
  }
  ```
- **Error:** 400 jika `kbli_code` kosong (harus pakai `/recommend`)

#### `PATCH /api/users/business-profile/kbli` (updated)
- **Purpose:** Simpan KBLI yang dipilih user (dari hasil recommend atau manual input)
- **Input:** `{ "kbli_code": "10791" }`
- **Logic:** Update `kbli_code`, regenerate roadmap, trigger matching engine
- **No AI call** — cuma simpan hasil yang sudah user pilih

---

### **2. Updated Endpoint**

#### `POST /api/users/business-profile` (refactored)
- **Removed:** Semua AI logic (Condition A/B)
- **Now:** Cuma simpan data business profile, no AI call
- **Response:** Tidak ada lagi `kbli_recommendation` field
  ```json
  {
    "status": "success",
    "message": "Business profile saved successfully",
    "data": {
      "business_profile": { ... },
      "roadmap": [ ... ]
    }
  }
  ```

---

### **3. Code Changes**

#### **Schemas** (`src/schemas/user.schema.ts`)
- ✅ Added `kbliRecommendationResponseSchema`
- ✅ Added `kbliValidationResponseSchema`
- ✅ Added `confirmKbliSchema`

#### **Services** (`src/services/business/user.service.ts`)
- ✅ Removed AI logic from `saveBusinessProfile()`
- ✅ Added `recommendKBLI()` — fetch profile, validate preconditions, call AI
- ✅ Added `validateKBLI()` — fetch profile, validate preconditions, call AI
- ✅ Added `confirmKBLI()` — update KBLI, regenerate roadmap

#### **Controllers** (`src/controllers/user.controller.ts`)
- ✅ Simplified `handleUpsertBusinessProfile` — no AI
- ✅ Added `handleRecommendKBLI`
- ✅ Added `handleValidateKBLI`
- ✅ Updated `handleConfirmKBLI` — now calls `userService.confirmKBLI()`

#### **Routes** (`src/routes/user.routes.ts`)
- ✅ Added `recommendKBLIRoute` with OpenAPI spec
- ✅ Added `validateKBLIRoute` with OpenAPI spec
- ✅ Updated `confirmKbliRoute` description
- ✅ Updated `upsertBusinessProfileRoute` description (removed AI mention)

#### **Repositories** (`src/repositories/user.repository.ts`)
- ✅ Added `updateKbliCode()` — partial update for KBLI only
- ✅ Removed `confirmKbliCode()` (replaced by `updateKbliCode()`)

#### **Types** (`src/types/responses.ts`)
- ✅ Removed `kbli_recommendation` from `UpsertBusinessProfileResponse`

---

## Frontend Flow (New)

### **Case 1: User belum tau KBLI**
1. User isi form business profile (tanpa KBLI) → `POST /api/users/business-profile`
2. User klik **"Dapatkan Rekomendasi KBLI"** → `POST /api/users/business-profile/kbli/recommend`
3. Frontend tampilkan hasil rekomendasi
4. User pilih KBLI → `PATCH /api/users/business-profile/kbli` → simpan + regenerate roadmap

### **Case 2: User sudah punya KBLI**
1. User isi form business profile (dengan KBLI) → `POST /api/users/business-profile`
2. User klik **"Validasi KBLI Saya"** → `POST /api/users/business-profile/kbli/validate`
3. Frontend tampilkan hasil validasi (valid/mismatch)
4. Jika mismatch, user bisa update → `PATCH /api/users/business-profile/kbli`

---

## Benefits

1. **Separation of Concerns** — upsert profile ≠ AI matching
2. **Better UX Control** — frontend bisa tampilkan UI yang berbeda untuk recommend vs validate
3. **Type Safety** — 2 response type yang jelas, tidak ada union type
4. **Explicit API** — developer langsung paham endpoint mana untuk case apa
5. **No Silent AI Calls** — user explicitly trigger AI scan

---

## Testing

✅ Server starts without errors
✅ All 3 KBLI endpoints appear in OpenAPI spec:
  - `/api/users/business-profile/kbli`
  - `/api/users/business-profile/kbli/recommend`
  - `/api/users/business-profile/kbli/validate`
✅ Hot reload works correctly
