import { PromptTemplate, PipelinePromptTemplate } from "langchain/prompts";

const fullPrompt = PromptTemplate.fromTemplate(`
You are a software developer.  Take the input and translate to valid output json.  Use the following schema to guide field names. The make is only Toyota or Lexus.

schema:
{schema}

when you see the following text in the input, replace it with the code:

{dictionary}

examples:
{examples}

Input: {input}
Output:
`);


const schemaPrompt =
  PromptTemplate.fromTemplate(`
   {{ accessoriesFactory: [StringInput],
     exteriorColor: String,
     interiorColor: String,
     seatingMaterial: String
     actualAssemblyDate: DateInput
   }}
  `);

const dictPrompt = PromptTemplate.fromTemplate(` 
{{text: "snow tires", code: "ST"}}
{{text: "backup camera", code: "BC"}}
{{text: "heated seats", code: "HS"}}
{{text: "carplay", code: "APPL-CP"}}
`);

const examplesPrompt = PromptTemplate.fromTemplate(`
Input: Search for green cars with black leather interior.
Output: {{"exteriorColor": "green","interiorColor": "black","interiorMaterial": "leather","type": "car"}}

Input: Find tundra trucks with leather seats. The seats should be red
Output: {{"exteriorColor": "green","interiorColor": "black",interiorMaterial": "leather",type: "truck"}}

Input: lexus suv within the next two weeks that is red with harmon kardon sound system
Output:  {{"exteriorColor": "red","interiorFeatures": "harmon kardon sound system",type: "suv","make": "lexus","availabilityInDays": 14}}

Input: Vehicles with actual assembly date of November 16th 2023.  Accessories from the factory should be heated seats and wireless apple car play. 
Output:  {{"actualAssemblyDate": "2023-11-16","accessoriesFactory": ["heated seats","wireless apple car play"]}}

Input: Accessories from the factory should be snow tires, backup camera.
Output: {{"accessoriesFactory": ["ST","BC"]}}

`);

const composedPrompt = new PipelinePromptTemplate({
  pipelinePrompts: [
    {
      name: "schema",
      prompt: schemaPrompt,
    },
    {
      name: "dictionary",
      prompt: dictPrompt,
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

