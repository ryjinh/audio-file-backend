CREATE TABLE users (
    uuid TEXT NOT NULL UNIQUE
);

INSERT INTO users (uuid) 
VALUES
    ('user-1'),
    ('user-2'),
    ('user-3'),
    ('user-4');

CREATE TABLE phrases (
    id INT NOT NULL,
    user_id TEXT NOT NULL,
    filepath TEXT NOT NULL,
    last_downloaded TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
            REFERENCES users(uuid)
);