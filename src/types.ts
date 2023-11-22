export type IBMAccessToken = {
    access_token: string
    refresh_token: string,
    ims_user_id: number,
    token_type: string,
    expires_in: number,
    expiration: number,
    scope: string
  }
  
  export interface IBMInput{
    apiKey?: string;
    watsonxProjectId: string;
    model: string;
    decodingMethod: string;
    maxTokens?: number;
    minTokens?: number;
    stopSequences?: string[];
    frequencyPenalty?: number;
    timeLimit?: number;
    /** Sampling temperature to use */
    temperature?: number;
    /** Total probability mass of tokens to consider at each step */
    topP?: number;
    /** Integer to define the top tokens considered within the sample operation to create new text. */
    topK?: number;
  }