import { PromptTemplate, PipelinePromptTemplate } from "langchain/prompts";

const fullPrompt = PromptTemplate.fromTemplate(`
explain how you would fix the input JSON to match the graphQL schema.  If it matches, just return the input json.

**graphQL schema**
{schema}

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


const composedPrompt = new PipelinePromptTemplate({
  pipelinePrompts: [
    {
      name: "schema",
      prompt: schemaPrompt,
    }
  ],
  finalPrompt: fullPrompt,
});


export async function formatPrompt(input: string, originalText: string) {
  const formattedPrompt = await composedPrompt.format({
    input: input,
    originalText: originalText,
  });
  return formattedPrompt;
}

