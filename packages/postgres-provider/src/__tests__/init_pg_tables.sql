CREATE TABLE users (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(40) NOT NULL,
    age int NOT NULL
);

CREATE TABLE posts (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title varchar(40) NOT NULL,
    content text NOT NULL,
    user_id int NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE post_revisions (
    post_id int NOT NULL,
    revision_number int NOT NULL,
    content text NOT NULL,
    PRIMARY KEY (post_id, revision_number),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

CREATE TABLE events (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(40) NOT NULL,
    payload jsonb NOT NULL
);
