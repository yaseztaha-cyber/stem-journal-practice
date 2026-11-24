// Lazy pdf-parse loader (shared by analyze + journal import).
//
// pdf-parse v2 is ESM-only: a top-level require() kills the whole backend on
// older Node runtimes (e.g. the packaged Electron Node). Always load lazily
// so a PDF-engine problem degrades to a clean 400, never a dead server.
let PDFParseCls: any = null;

export async function loadPDFParse(): Promise<any> {
  if (PDFParseCls) return PDFParseCls;
  let mod: any = null;
  try {
    // Modern Node (>=22) can require() ESM.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('pdf-parse') as any;
  } catch {
    mod = await Function('return import("pdf-parse")')();
  }
  PDFParseCls = mod?.PDFParse ?? mod?.default?.PDFParse ?? mod?.default ?? null;
  if (!PDFParseCls) throw new Error('PDF engine unavailable');
  return PDFParseCls;
}
