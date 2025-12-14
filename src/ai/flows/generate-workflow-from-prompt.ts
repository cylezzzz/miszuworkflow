'use server';
/**
 * @fileOverview AI agent that generates a basic workflow structure with suggested nodes based on a user prompt.
 *
 * - generateWorkflowFromPrompt - A function that generates a workflow from a prompt.
 * - GenerateWorkflowFromPromptInput - The input type for the generateWorkflowFromPrompt function.
 * - GenerateWorkflowFromPromptOutput - The return type for the generateWorkflowFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWorkflowFromPromptInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A description of the workflow to generate, including the desired functionality and any specific requirements.'
    ),
});
export type GenerateWorkflowFromPromptInput = z.infer<
  typeof GenerateWorkflowFromPromptInputSchema
>;

const GenerateWorkflowFromPromptOutputSchema = z.object({
  workflowJson: z
    .string()
    .describe(
      'A JSON string representing the generated workflow structure, including suggested nodes and their connections.'
    ),
});
export type GenerateWorkflowFromPromptOutput = z.infer<
  typeof GenerateWorkflowFromPromptOutputSchema
>;

export async function generateWorkflowFromPrompt(
  input: GenerateWorkflowFromPromptInput
): Promise<GenerateWorkflowFromPromptOutput> {
  return generateWorkflowFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkflowFromPromptPrompt',
  input: {schema: GenerateWorkflowFromPromptInputSchema},
  output: {schema: GenerateWorkflowFromPromptOutputSchema},
  prompt: `You are an AI workflow generation assistant. Your task is to take a user's prompt describing a desired workflow and generate a basic workflow structure in JSON format. The workflow should include suggested nodes and their connections to achieve the described functionality.

User Prompt: {{{prompt}}}

Respond with JSON format. Enclose the JSON inside triple backticks.
`,
});

const generateWorkflowFromPromptFlow = ai.defineFlow(
  {
    name: 'generateWorkflowFromPromptFlow',
    inputSchema: GenerateWorkflowFromPromptInputSchema,
    outputSchema: GenerateWorkflowFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
