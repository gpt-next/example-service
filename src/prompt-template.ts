import { PromptTemplate, PipelinePromptTemplate } from "langchain/prompts";

const fullPrompt = PromptTemplate.fromTemplate(`
You an expert developer at translating text input to JSON.  You strictly map the input below to the following graphQL schema. Only include attributes in Result.  Always include the property "stopToken": true as the last attribute.

**graphQL schema**
{schema}

examples:
{examples}

Input: {input}
Output:
`);


const schemaPrompt =
  PromptTemplate.fromTemplate(`
  type Result{{
    paintColor: string;
    model: Model;
    brand: "Toyota" | "Lexus";
    interiorMaterial: string;
    interiorMaterialColor: string;
    featuresFromFactory: [Feature];
    requestedETAInDays: number;
  }}
  
  union Model = ToyotaModel | LexusModel;
  
  enum ToyotaModel{{
      TCOR123: "corolla"
      TTUN13: "tundra"
  }}
  enum LexusModel{{
      LIS12A: "IS"
  }}
  
  enum Feature{{
     APPLCP: "apple car play"
     SNWTIRE: "snow tires"
     HEATW: "heated steering wheel"
  }}
  `);


const examplesPrompt = PromptTemplate.fromTemplate(`
  Input: I would like a blue IS with interior leather black.  Car should have apple car play.  Should have interior fabric not leather.
  Output: {{
    "paintColor": "blue",
    "model": "LIS12A",
    "brand":  "Lexus",
     "interiorMaterial": "fabric",
     "featuresFromFactory": ["APPLCP"],
     "stopToken": true
  }}
  Input: Red camero with white interior, delivered in two weeks
  Output: {{
    "paintColor": "red",
    "model":  null,
    "brand":  null,
     "interiorMaterial": null,
      interiorMaterialColor: "white",
     "featuresFromFactory": [],
     "requestedETAInDays": 14,
     "stopToken": true
  }}
`);

const composedPrompt = new PipelinePromptTemplate({
  pipelinePrompts: [
    {
      name: "schema",
      prompt: schemaPrompt,
    },
    {
      name: "examples",
      prompt: examplesPrompt,
    },
  ],
  finalPrompt: fullPrompt,
});


export async function formatPrompt(input: string) {
  const formattedPrompt = await composedPrompt.format({
    input: input,
  });
  return formattedPrompt;
}

