-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "appointment_id" INTEGER NOT NULL,
    "bids" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "Bid_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bid_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bid" ("appointment_id", "bids", "id", "user_id") SELECT "appointment_id", "bids", "id", "user_id" FROM "Bid";
DROP TABLE "Bid";
ALTER TABLE "new_Bid" RENAME TO "Bid";
CREATE TABLE "new_Appointement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL DEFAULT '',
    "endDate" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "user_id" INTEGER,
    "doctor_id" INTEGER,
    "doctor_post_id" INTEGER,
    "category_id" INTEGER,
    CONSTRAINT "Appointement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointement_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointement_doctor_post_id_fkey" FOREIGN KEY ("doctor_post_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointement_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Appointement" ("category_id", "description", "doctor_id", "doctor_post_id", "endDate", "id", "price", "startDate", "status", "title", "user_id") SELECT "category_id", "description", "doctor_id", "doctor_post_id", "endDate", "id", "price", "startDate", "status", "title", "user_id" FROM "Appointement";
DROP TABLE "Appointement";
ALTER TABLE "new_Appointement" RENAME TO "Appointement";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
