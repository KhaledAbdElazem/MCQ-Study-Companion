import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjs from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
// Set worker directly to the imported worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface MCQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

async function extractTextFromPDF(pdfData: ArrayBuffer): Promise<string> {
  try {
    const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

export async function testGeminiAPI(): Promise<boolean> {
  try {
    console.log("Testing Gemini API...");

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
      },
    });

    const prompt = "Generate one multiple choice question about cats.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("API Test Result:", text);
    return true;
  } catch (error) {
    console.error("API Test Error:", error);
    return false;
  }
}

export async function generateMCQs(
  fileContent: string | ArrayBuffer,
  onProgress: (progress: number) => void
): Promise<string> {
  try {
    // Extract text from PDF if content is ArrayBuffer
    const textContent =
      typeof fileContent === "string"
        ? fileContent
        : await extractTextFromPDF(fileContent);

    console.log("Extracted text sample:", textContent.slice(0, 500)); // Debug log

    if (textContent.length < 100) {
      throw new Error("Not enough readable content found in the document");
    }

    const batchSize = 10;
    const totalBatches = 5;
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    let allQuestions = "";

    // Split content into chunks
    const contentChunks = [];
    const chunkSize = Math.ceil(textContent.length / totalBatches);
    for (let i = 0; i < textContent.length; i += chunkSize) {
      contentChunks.push(
        textContent.slice(i, Math.min(i + chunkSize, textContent.length))
      );
    }

    for (let batch = 0; batch < totalBatches; batch++) {
      try {
        console.log(`Generating batch ${batch + 1}/${totalBatches}...`);
        onProgress(Math.round((batch / totalBatches) * 100));

        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        });

        const prompt = `Create ${batchSize} multiple choice questions based on this lecture content:

          "${contentChunks[batch]}"

          Requirements:
          - Questions should test understanding of the lecture content
          - Make questions suitable for a classroom quiz
          - DO NOT create questions about PDF structure or formatting
          
          Format each question exactly like this:
          Q1. [Question]
          A) [Option]
          B) [Option]
          C) [Option]
          D) [Option]
          Answer: [A/B/C/D]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text) {
          allQuestions += text + "\n\n";
          console.log(`Batch ${batch + 1} completed successfully`);

          if (batch < totalBatches - 1) {
            console.log("Waiting before next batch...");
            await delay(15000);
          }
        }
      } catch (error: any) {
        console.error(`Error in batch ${batch + 1}:`, error);
        if (error?.message?.includes("429")) {
          const waitTime = 20000;
          console.log(`Rate limit hit, waiting ${waitTime / 1000} seconds...`);
          await delay(waitTime);
          batch--; // Retry this batch
          continue;
        }
        throw error;
      }
    }

    if (!allQuestions) {
      throw new Error("No questions were generated");
    }

    return allQuestions;
  } catch (error) {
    console.error("Error generating MCQs:", error);
    throw error;
  }
}

export function parseMCQs(mcqText: string): MCQuestion[] {
  const questions: MCQuestion[] = [];
  const questionBlocks = mcqText
    .split(/Q\d+\./g)
    .filter((block) => block.trim());

  for (const block of questionBlocks) {
    try {
      const lines = block.trim().split("\n");
      const question = lines[0].trim();
      const options: string[] = [];
      let correctAnswer = -1;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^[A-D]\)/)) {
          options.push(trimmedLine.substring(2).trim());
        } else if (trimmedLine.startsWith("Answer:")) {
          const answerLetter = trimmedLine.split(":")[1].trim();
          correctAnswer = answerLetter.charCodeAt(0) - 65; // Convert A,B,C,D to 0,1,2,3
        }
      }

      if (question && options.length === 4 && correctAnswer >= 0) {
        questions.push({
          question,
          options,
          correctAnswer,
        });
        console.log("Added question:", {
          question,
          options,
          correctAnswer,
        });
      }
    } catch (error) {
      console.error("Error parsing question block:", error);
    }
  }

  return questions;
}
