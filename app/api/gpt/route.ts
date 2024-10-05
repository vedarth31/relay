import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI();

async function parseData(query: string) {

    const instructions = "Tell me the status of this order based on the information from this email. Reply with only one word - shipped, delivered, placed, received.";

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
                role: "user",
                content: instructions  + query,
            },
        ],
    });
    
    return completion.choices[0].message;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
        }

        const response = await parseData(query);
        return NextResponse.json(response);
    } catch (error) {
        const err = error as Error;
        console.error('Error fetching emails:', err);
        return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
    }
}
