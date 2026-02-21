declare module "pdfkit" {
  import { Readable } from "stream";

  export = PDFDocument;
  class PDFDocument extends Readable {
    constructor(options?: any);
    fontSize(size: number): this;
    text(text: string, options?: any): this;
    moveDown(lines?: number): this;
    on(event: string, listener: Function): this;
    end(): void;
  }
}
