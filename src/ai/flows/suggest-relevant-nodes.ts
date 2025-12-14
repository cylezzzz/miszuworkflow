'use server';

/**
 * @fileOverview AI agent that suggests relevant nodes based on the current workflow and task requirements.
 *
 * - suggestRelevantNodes - A function that suggests relevant nodes for a given workflow and task.
 * - SuggestRelevantNodesInput - The input type for the suggestRelevantNodes function.
 * - SuggestRelevantNodesOutput - The return type for the suggestRelevantNodes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantNodesInputSchema = z.object({
  currentWorkflow: z
    .string()
    .describe('The current workflow represented as a JSON string.'),
  taskRequirements: z
    .string()
    .describe('The task requirements for the workflow.'),
});
export type SuggestRelevantNodesInput = z.infer<typeof SuggestRelevantNodesInputSchema>;

const SuggestRelevantNodesOutputSchema = z.object({
  suggestedNodes: z
    .array(z.string())
    .describe('An array of suggested node names that are relevant to the workflow and task requirements.'),
});
export type SuggestRelevantNodesOutput = z.infer<typeof SuggestRelevantNodesOutputSchema>;

export async function suggestRelevantNodes(input: SuggestRelevantNodesInput): Promise<SuggestRelevantNodesOutput> {
  return suggestRelevantNodesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantNodesPrompt',
  input: {schema: SuggestRelevantNodesInputSchema},
  output: {schema: SuggestRelevantNodesOutputSchema},
  prompt: `You are an AI assistant that suggests relevant nodes for a workflow canvas.

  Given the current workflow and task requirements, suggest a list of node names that would be helpful to the user.

  Current Workflow:
  {{currentWorkflow}}

  Task Requirements:
  {{taskRequirements}}

  Suggested Nodes (as a JSON array of strings):
  `,
});

const suggestRelevantNodesFlow = ai.defineFlow(
  {
    name: 'suggestRelevantNodesFlow',
    inputSchema: SuggestRelevantNodesInputSchema,
    outputSchema: SuggestRelevantNodesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
