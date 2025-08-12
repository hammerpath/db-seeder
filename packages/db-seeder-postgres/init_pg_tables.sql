CREATE TABLE users (
    id integer PRIMARY KEY,
    name varchar(40) NOT NULL,
    age int NOT NULL
);

CREATE TABLE posts (
    id integer PRIMARY KEY,
    title varchar(40) NOT NULL,
    content text NOT NULL,
    user_id int NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
