# Organization Relationships - RESTful API

## For the _pipedrive_ backend technical challenge
Using Node.js,(with express), PostgreSQL and docker.

The goal of this task it to create a RESTful service that stores organisations with relations (parent to child relation).

## API Endpoints

1. POST  
    http://localhost:3000/organizations
     - Adds the organizations with relations to the database.
     Using the following format for the request body:
    `
    {
	"org_name": "Paradise Island",
	"daughters": [
		{
			"org_name": "Banana tree",
			"daughters": [
				{
					"org_name": "Yellow Banana"
				},
				{
					"org_name": "Brown Banana"
				},
				{
					"org_name": "Black Banana"
				}
			]
		},
		{
			"org_name": "Big banana tree",
			"daughters": [
				{
					"org_name": "Yellow Banana"
				},
				{
					"org_name": "Brown Banana"
				},
				{
					"org_name": "Green Banana"
				},
				{
					"org_name": "Black Banana",
					"daughters": [
						{
							"org_name": "Phoneutria Spider"
						}
					]
				}
			]
		}
	]
	}
    `
     

2. GET  
    http://localhost:3000/organizations/?name=org_name&&page=1&pageSize=100
    - Retrieve all relations of one organization (includes all parents daughters and sisters). Queried by name. List is ordered by name and one page may return 100 rows at max with pagination support. The result will look like this:
	`
	[{
	"relationship_type": "parent",
	"org_name": "Banana tree"
	}, {
	"relationship_type": "parent",
	"org_name": "Big banana tree"
	}, {
	"relationship_type": "sister",
	"org_name": "Brown Banana"
	}, {
	"relationship_type": "sister",
	"org_name": "Green Banana"
	}, {
	"relationship_type": "daughter",
	"org_name": "Phoneutria Spider"
	}, {
	"relationship_type": "sister",
	"org_name": "Yellow Banana"
	}]
	`

------

### Instructions to run the project locally

0. have docker and docker-compose installed
1. clone the repositor in your local machine
2. navigate to the directory containing the docker-compose.yml file
3. run docker-compose up -d --build
4. Use [postman](https://www.getpostman.com/) or an equivalent software to make use of the endpoints like explained above

------

### Questions

3. a)
3. b) 

------

### Extra considerations (nice to haves I did not implement)

- There are no unit tests;
- Very basic error handling and input validation;
- A lot of configurations are hardcoded instead of using best practices like adding them .env files;
- No transactions in the db connection
