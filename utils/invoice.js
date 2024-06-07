const fs = require("fs");
const PDFDocument = require("pdfkit");

function createInvoice(invoice, path ,res) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });
  const writepath = doc.pipe(fs.createWriteStream(path)); 

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  doc.end();
    // Send the PDF file as a response
    writepath.on('finish', () => {
      
       res.download(path, `invoice-${invoice.order_id}.pdf`, (err) => {
         if (err) {
           console.log(err);
         }
         // Clean up the file after sending
         fs.unlinkSync(path); 
       });
     });
   
}

function generateHeader(doc) {
  doc
    .image("logo.png", 30, 50, { width: 120 })
    .fillColor("#444444")
    
    
    .fontSize(10)
    .text("Elektronix.", 200, 50, { align: "right" })
    .text("123 Main Street", 200, 65, { align: "right" })
    .text("Kerala, India, 10025", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
  .fontSize(10)
  .text("Order ID:", 50, customerInformationTop)
  .font("Helvetica-Bold")
  .text(invoice.order_id, 150, customerInformationTop)
  .font("Helvetica")
  
    .text("Order Date:", 50, customerInformationTop + 15)
    .text(invoice.order_date, 150, customerInformationTop + 15)
  .text("Invoice Number:", 50, customerInformationTop +30)
  .font("Helvetica-Bold")
  .text(invoice.invoice_nr, 150, customerInformationTop+30)
  .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 45)
    .text(invoice.invoice_date, 150, customerInformationTop + 45)
    .text("Payment status:", 50, customerInformationTop + 75)
    .text(invoice.payment_status,150,customerInformationTop + 75)

    .font("Helvetica-Bold")
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.shipping.address, 300, customerInformationTop + 15)
    .text(
      invoice.shipping.city +
        ", " +
        invoice.shipping.state +
        ", " +
        invoice.shipping.country,
      300,
      customerInformationTop + 30
    )
    .text("Phone:", 300, customerInformationTop + 45)
    .text(invoice.shipping.phone,400,customerInformationTop + 45)
    .moveDown();

  generateHr(doc, 265);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Product",
    "Description",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 50;
    generateTableRow(
      doc,
      position,
      item.product,
      item.brand +'\n' + item.color + "\n" + item.storage + " "+ item.ram,
      formatCurrency(item.amount / item.quantity),
      item.quantity,
      formatCurrency(item.amount)
    );

    generateHr(doc, position + 40);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 60;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(invoice.subtotal)
  );

  const discountAmountPosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    discountAmountPosition,
    "",
    "",
    "Discount Amount",
    "",
    formatCurrency(invoice.discount)
  );

  const totalAmountPosition = discountAmountPosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    totalAmountPosition,
    "",
    "",
    "Total Amount",
    "",
    formatCurrency(invoice.total)
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Thank you for shopping with us !",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(rupees) {
  return "Rs." + rupees.toFixed(2);
}



module.exports = {
  createInvoice
};