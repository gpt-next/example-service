import express from 'express';
import { graphqlHTTP } from "express-graphql"
import { buildSchema } from "graphql"
import { WatsonxInference } from "./watsonx";
import {formatPrompt} from './prompt-template';

const llm = new WatsonxInference({
  apiKey: process.env["IBM_API_KEY"],
  temperature: 0,
  watsonxProjectId: process.env["WATSON_X_PROJECT_ID"],
  model: "ibm/granite-13b-chat-v1",
  maxTokens: 512
});

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
  const formattedPrompt = await formatPrompt(searchInput);
  const text = await llm.predict(formattedPrompt);
  return {text: `${text}`}
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
    res.json({
      data: {
        findVehicles: text
      }
    })
  })
  .catch((err) => {
    res.send(err)
  })
})
app.listen(4000)
console.log("Running a GraphQL API server at http://localhost:4000/graphql")