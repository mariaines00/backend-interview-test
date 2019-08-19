# Organization Relationships - RESTful API

## For the _pipedrive_ backend technical challenge
## Author: Maria Inês Serra
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

3. a)The implemented solution was not build taking into consideration such a large dataset. I have not tested but there's a chance that the algorithm for parsing the data from the incomng POST request body might push past Node's heap limit (v8's default is 1.4 GB tho). It will be very inneficient in terms of performance, especially regarding I/O operations (for the HTTP requests and the database connections).

3. b) In order to support such an high number of relations we would need to make changes on both the server and the database. For the post endpoint, if we wish to maintain the capability of inserting everything at once we would have to increase the maximum permited body size (althougt it is both unsafe and taxing on the networks). The recursive algorithm I implemented to parse the incoming data from the body of the POST request would also need to be re-done, as it stands it's very likely to run out of memory in the heap, the same applies for incoming data from the database. A good improvement here involves using a duplex(streams) so that we can parse and transform the data as it is written and read. On the database side it might necessary to implement a more efficient way of accessing the data, using indexes and therefore reducing the number of IOs required to find the required data rows.

------

### Extra considerations (regarding the implementation´´~´~~)

- There are no unit tests;
- Very basic error handling and input validation, meaning that is not very robust nor battle ready;
- A lot of configurations are hardcoded instead of using best practices like adding them .env files;
