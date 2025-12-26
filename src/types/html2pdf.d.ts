declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: { scale?: number; useCORS?: boolean; [key: string]: any };
    jsPDF?: { unit?: string; format?: string; orientation?: string };
    pagebreak?: { mode?: string | string[]; before?: string[]; after?: string[]; avoid?: string[] };
    enableLinks?: boolean;
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement | string): Html2Pdf;
    save(): Promise<void>;
    outputPdf(type: "blob"): Promise<Blob>;
    outputPdf(type: "datauristring"): Promise<string>;
    outputPdf(type: "arraybuffer"): Promise<ArrayBuffer>;
  }

  function html2pdf(): Html2Pdf;
  export default html2pdf;
}
