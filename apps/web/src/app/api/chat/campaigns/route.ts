import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  getTopCampaigns,
  getSpendTrends,
  getCampaignMetrics,
  getPlatformComparison,
  getCACAnalysis,
} from '@/lib/chat/campaignQueries';
import { hasEnoughCredits, spendCredits } from '@/lib/subscription/creditManager';

export const dynamic = 'force-dynamic';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// System prompt that teaches the LLM how to interpret campaign questions
const SYSTEM_PROMPT = `You are a helpful campaign analytics assistant for Synter, a cross-platform advertising management tool.

You have access to these functions to answer questions about campaigns:
- getTopCampaigns(metric, limit, days): Get top performing campaigns by metric (spend|clicks|conversions|roas)
- getSpendTrends(days, platform): Get spend trends over time, optionally filtered by platform
- getCampaignMetrics(campaignName): Get detailed metrics for a specific campaign
- getPlatformComparison(days): Compare performance across platforms (Google, Reddit, Twitter/X)
- getCACAnalysis(days): Analyze customer acquisition costs

When a user asks a question, determine which function to call and extract the parameters.
Respond with a JSON object in this format:
{
  "function": "functionName",
  "params": { "param1": value1, "param2": value2 }
}

Examples:
User: "What's my best performing campaign?"
Response: { "function": "getTopCampaigns", "params": { "metric": "conversions", "limit": 5, "days": 30 } }

User: "Show me spend trends for the last week"
Response: { "function": "getSpendTrends", "params": { "days": 7 } }

User: "How is my Summer Sale campaign doing?"
Response: { "function": "getCampaignMetrics", "params": { "campaignName": "Summer Sale" } }

User: "Compare platform performance"
Response: { "function": "getPlatformComparison", "params": { "days": 30 } }

User: "What's my CAC looking like?"
Response: { "function": "getCACAnalysis", "params": { "days": 30 } }

If the question is unclear or you can't map it to a function, respond with:
{ "function": "none", "message": "helpful clarification question" }`;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // TODO: Get actual user ID from session/JWT
    const userId = 1; // Placeholder

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(userId, 'chat_query');
    if (!hasCredits) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          message: 'You need 0.5 credits to ask a question. Visit /credits to buy more.',
          upgradeUrl: '/credits'
        },
        { status: 402 }
      );
    }

    // Use OpenAI to interpret the user's question
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-3).map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content: message },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const intent = JSON.parse(responseContent);

    // Deduct credits AFTER successful AI processing
    const spendResult = await spendCredits(userId, 'chat_query', {
      question: message,
      intent: intent.function,
    });

    if (!spendResult.success) {
      console.error('Failed to deduct credits:', spendResult.error);
    }

    // Execute the appropriate query function
    let result;
    switch (intent.function) {
      case 'getTopCampaigns':
        result = await getTopCampaigns(
          intent.params?.metric || 'conversions',
          intent.params?.limit || 5,
          intent.params?.days || 30
        );
        break;
      case 'getSpendTrends':
        result = await getSpendTrends(
          intent.params?.days || 30,
          intent.params?.platform
        );
        break;
      case 'getCampaignMetrics':
        result = await getCampaignMetrics(intent.params?.campaignName || '');
        break;
      case 'getPlatformComparison':
        result = await getPlatformComparison(intent.params?.days || 30);
        break;
      case 'getCACAnalysis':
        result = await getCACAnalysis(intent.params?.days || 30);
        break;
      case 'none':
        result = {
          message:
            intent.message ||
            "I'm not sure how to help with that. Try asking about campaign performance, spend trends, or platform comparisons.",
        };
        break;
      default:
        result = {
          message: "I couldn't understand that question. Try asking about your top campaigns or spend trends.",
        };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', message: 'Sorry, something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
