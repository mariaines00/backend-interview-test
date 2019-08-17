
GRANT ALL PRIVILEGES ON DATABASE organizations TO pipedrive;

CREATE TABLE organizations (
    id SERIAL,
    name VARCHAR(50) NOT NULL UNIQUE PRIMARY KEY
);

CREATE TABLE relationships (
    id SERIAL PRIMARY KEY,
    start_org VARCHAR(50) NOT NULL /*REFERENCES organizations(name)*/,
    end_org VARCHAR(50) NOT NULL /*REFERENCES organizations(name)*/,
    relation_type VARCHAR(10) CHECK(relation_type = 'parent' OR relation_type = 'sister')
);