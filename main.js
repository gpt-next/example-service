var express = require("express")
var { graphqlHTTP } = require("express-graphql")
var { buildSchema } = require("graphql")

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
 
  type SearchResult{
    text: String!
  }
  type Query {
    findVehicles(searchInput: String!): SearchResult!
  }
`)


async function findVehicles(searchInput) {
  return {text: `No cars found for your query ${searchInput}`}
}

// The root provides a resolver function for each API endpoint
var root = {
  findVehicles: findVehicles
}

var app = express()
app.use(
  "/example-service/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)

app.get("/example-service/query", (req, res) => {
 findVehicles(req.query.query)
  .then((text) => {
    res.send(JSON.stringify({
      data: {
        findVehicles: text
      }
    }))
  })
  .catch((err) => {
    res.send(err)
  })
})
app.listen(4000)
console.log("Running a GraphQL API server at http://localhost:4000/graphql")