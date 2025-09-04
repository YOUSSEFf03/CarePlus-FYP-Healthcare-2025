import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function downloadAsPdf(el: HTMLElement, fileName = "prescription.pdf") {
    // Use a higher scale for crisp text
    const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
        compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Our element is already sized close to A4; fit proportionally
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const y = (pageHeight - imgHeight) / 2 > 0 ? (pageHeight - imgHeight) / 2 : 0;
    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight, undefined, "FAST");
    pdf.save(fileName);
}