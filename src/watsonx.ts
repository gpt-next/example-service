import {ResultAsync} from 'neverthrow';
import axios from 'axios';
import {IBMAccessToken,IBMInput} from './types';
import {LLM, BaseLLMParams} from "langchain/llms/base";


export function getAccessToken(apiKey: string): ResultAsync<IBMAccessToken,Error>{
  const params = new URLSearchParams({ 
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey: apiKey 
  });
  return ResultAsync.fromPromise(
    axios.post('https://iam.cloud.ibm.com/identity/token',params).then(res =>{
      
      return res.data;
    }),
  (e) => Error(`Error fetching IBM IAM access token ${e}`))
}

export class WatsonxInference extends LLM implements IBMInput{
  override get lc_secrets(): { [key: string]: string } | undefined {
    return {
      apiKey: "IBM_API_KEY",
    };
  }

  model = "google/flan-ul2";
  temperature: number | undefined = undefined;
  maxTokens: number | undefined = undefined;
  topP: number | undefined = undefined;
  topK: number | undefined = undefined;
  frequencyPenalty: number | undefined = undefined;
  apiKey: string | undefined = undefined;
  timeLimit: number | undefined = undefined
  watsonxProjectId: string;
  decodingMethod: string = "greedy";
  ibmAccessToken: IBMAccessToken | undefined = undefined;

  constructor(fields?: Partial<IBMInput> & BaseLLMParams) {
    super(fields ?? {});

    if(!fields?.watsonxProjectId){
      throw new Error("Please ensure that you set the Watsonx.ai project id");
    }
    this.watsonxProjectId = fields?.watsonxProjectId;
    this.decodingMethod = fields?.decodingMethod ?? this.decodingMethod;
    this.model = fields?.model ?? this.model;
    this.temperature = fields?.temperature ?? this.temperature;
    this.maxTokens = fields?.maxTokens ?? this.maxTokens;
    this.topP = fields?.topP ?? this.topP;
    this.topK = fields?.topK ?? this.topK;
    this.frequencyPenalty = fields?.frequencyPenalty ?? this.frequencyPenalty;
    this.apiKey =
      fields?.apiKey ?? process.env["IBM_API_KEY"];
    if (!this.apiKey) {
      throw new Error(
        "Please set an API key for IBM Cloud in the environment variable IBM_API_KEY or in the apiKey field of the WatsonxInference constructor."
      );
    }
  }

  _llmType() {
    return "watsonx";
  }

   /** @ignore */
   async _call(prompt: string, options: this["ParsedCallOptions"]): Promise<string> {
    //Get the access token if we do not have one already
    if(!this.apiKey){throw new Error("apiKey is not defined to make this call!")}
    if(!this.ibmAccessToken){
      const res = await getAccessToken(this.apiKey);
      if(res.isOk()){
        this.ibmAccessToken = res.value;
        axios.defaults.headers.post['Authorization'] = `Bearer ${this.ibmAccessToken.access_token}`;
      }
    }
    
    const res = await this.caller.callWithOptions(
      { signal: options.signal },
      this._textGen.bind(this),
      {
        model_id: this.model,
        project_id: this.watsonxProjectId,
        input: prompt,
        parameters: {
          decoding_method: this.decodingMethod,
          max_new_tokens: this.maxTokens,
          min_new_tokens: 0,
          stop_sequences: [
            "}" //todo: make this configurable
          ],
          repetition_penalty: this.frequencyPenalty
        }
      }
    );
    return res;
  }

  async _textGen(options: any): Promise<string>{
    try{
      //console.log(`The prompt lanchain gave me is: ${options.input}`)
      const res = await axios.post("https://us-south.ml.cloud.ibm.com/ml/v1-beta/generation/text?version=2023-05-29",options,{});
      return res.data.results[0]?.generated_text;
    }catch(e){
      //Just try a fresh token next time
      this.ibmAccessToken = undefined;
      throw e;
    }
  }




}