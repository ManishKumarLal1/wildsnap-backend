ALTER TABLE users
ADD CONSTRAINT username_length
CHECK (char_length(username) >= 3);

ALTER TABLE users
ADD CONSTRAINT email_lowercase
CHECK (email = lower(email));

ALTER TABLE users
ADD CONSTRAINT xp_non_negative
CHECK (xp >= 0);

ALTER TABLE users
ADD CONSTRAINT level_positive
CHECK (level >= 1);

ALTER TABLE users
ADD CONSTRAINT streak_non_negative
CHECK (streak >= 0);