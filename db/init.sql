
GRANT ALL PRIVILEGES ON DATABASE organizations TO pipedrive;

CREATE TABLE organizations (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE relationships (
    id SERIAL PRIMARY KEY,
    start_org INT NOT NULL REFERENCES organizations(id),
    end_org INT NOT NULL REFERENCES organizations(id),
    relationship_type VARCHAR(10) CHECK(relationship_type = 'parent' OR relationship_type = 'sister')
);