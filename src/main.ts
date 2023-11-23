import express from 'express';
import { graphqlHTTP } from "express-graphql"
import { buildSchema } from "graphql"
import { WatsonxInference } from "./watsonx";
import {formatPrompt} from './prompt-template';
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

const memory = new BufferMemory();
let simpleMemory = "";
const model = new WatsonxInference({
  apiKey: process.env["IBM_API_KEY"],
  temperature: 0,
  watsonxProjectId: process.env["WATSON_X_PROJECT_ID"],
  model: "ibm/granite-13b-chat-v1",
  maxTokens: 512
});

const chain = new ConversationChain({ llm: model, memory: memory });

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
  if(searchInput.toLowercase().includes("thanks")) {
    simpleMemory = "";
  }
  simpleMemory  = simpleMemory + ". " + searchInput;
  const formattedPrompt = await formatPrompt(simpleMemory);
  //const text = await chain.call({ input: formattedPrompt });
  const text = await model.predict(formattedPrompt);

  console.log(text)
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