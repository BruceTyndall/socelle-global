import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { validateInput, validateOutput, blockedResult, type GuardrailResult } from './analysis/guardrails';
import { withCreditGate } from './analysis/creditGate';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractionResult {
  text: string;
  success: boolean;
  error?: string;
  meta?: {
    pageCount?: number;
    wordCount?: number;
  };
}

export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractFromPDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractFromDOCX(file);
    } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      return {
        text: '',
        success: false,
        error: 'Legacy .doc files are not supported. Please save as .docx and try again.',
      };
    } else {
      return {
        text: '',
        success: false,
        error: 'Unsupported file type. Please upload a PDF or DOCX file.',
      };
    }
  } catch (error) {
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract text from file',
    };
  }
}

async function extractFromPDF(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    const text = fullText.trim();

    if (!text || text.length < 10) {
      return {
        text: '',
        success: false,
        error: 'This PDF appears to be scanned or image-based. Please paste text or upload a text-based PDF.',
      };
    }

    return {
      text,
      success: true,
      meta: {
        pageCount: numPages,
        wordCount: text.split(/\s+/).length,
      },
    };
  } catch {
    return {
      text: '',
      success: false,
      error: 'Failed to parse PDF. The file may be corrupted or password-protected.',
    };
  }
}

async function extractFromDOCX(file: File): Promise<ExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const result = await mammoth.extractRawText({ arrayBuffer });

    const text = result.value.trim();

    if (!text || text.length < 10) {
      return {
        text: '',
        success: false,
        error: 'This document appears to be empty or contains only images. Please paste text instead.',
      };
    }

    return {
      text,
      success: true,
      meta: {
        wordCount: text.split(/\s+/).length,
      },
    };
  } catch {
    return {
      text: '',
      success: false,
      error: 'Failed to parse DOCX. The file may be corrupted or password-protected.',
    };
  }
}

// ── Guarded Document Extraction ──────────────────────────────────────────────

/**
 * Guarded document extraction — validates extracted text through guardrails,
 * checks credits, wraps output with safety metadata.
 */
export async function extractGuardedTextFromFile(
  file: File,
  userId: string,
): Promise<GuardrailResult<ExtractionResult>> {
  // Extract first (no guardrail on file bytes, only on resulting text)
  const result = await extractTextFromFile(file);

  if (!result.success || !result.text) {
    return validateOutput(result as any, 'documentExtraction', ['uploaded_file']) as GuardrailResult<ExtractionResult>;
  }

  // Guardrail check on extracted text
  const inputCheck = validateInput(result.text, 'documentExtraction');
  if (!inputCheck.valid && inputCheck.blocked) {
    return blockedResult(
      'documentExtraction',
      inputCheck.blockReason ?? 'Extracted text contains blocked content.',
    );
  }

  // Credit gate (deduct for successful extraction)
  await withCreditGate(userId, 'documentExtraction', async () => result);

  return validateOutput(result as any, 'documentExtraction', ['uploaded_file']) as GuardrailResult<ExtractionResult>;
}
