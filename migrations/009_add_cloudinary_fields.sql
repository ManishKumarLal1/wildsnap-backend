ALTER TABLE species
ADD COLUMN cloudinary_public_id TEXT;

ALTER TABLE observations
ADD COLUMN cloudinary_public_id TEXT;
