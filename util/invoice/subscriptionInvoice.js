const pdfKit = require('pdfkit');
const fs = require('fs');

const subscriptionInvoice = ({ invoice_id, customerInfo, subscriptionInfo, filePath }) => {

const {
	plan,
	plan_type,
	subscription_fees,
	prev_balance,
	net_cost,
	total_payment,
	promotion,
	discount_rate,
	discount_price,
	vat_price,
	total_cost,
	ending_balance,
	subscriptions,
} = subscriptionInfo || {};

// const options = { year: 'numeric', month: 'long', day: 'numeric' };
const options = { year: 'numeric', month: 'long' };
const formattedDate = new Intl.DateTimeFormat('en-US', options).format(new Date());

const companyLogo = "upload/cover/sku_logo.png";
const qrCode = "upload/avatar/qr.png";
const fileName = filePath;
const font = 'Helvetica';
const fontBold = 'Helvetica-Bold';

const sellerInfo = {
companyName: "ALARDH ALMUTQEN FOR TRS EST",
address: "7260 King Abdulaziz St 4820",
city: "Al Rabi District",
state: "Riyadh",
country: "Saudi Arabia",
vat: 310102316300003,
zipCode: "400017",
phone: "+910000000600"
}

// const customerInfo = {
// companyName: "Customer Company",
// address: "38/6 Sarulia",
// city: "Demra",
// state: "Dhaka",
// country: "Bangladesh",
// vat: 310102316300003,
// zipCode: "400054",
// phone: "+910000000787"
// }

const orderInfo = {
	products: [
		{
			"id": "1",
			"description": "B2C Partner Stores",
			"plan_duration": "Monthly",
			"plan_price": 999,
			"vat_price": 452,
		},
	],
	totalValue: 4997
}

const doc = new pdfKit({
	margins: { top: 30, left: 40, right: 40, bottom: 20 },
  size: 'A4',
  layout: 'portrait'
});


const stream = fs.createWriteStream(fileName);
doc.pipe(stream);

doc.fontSize(10);

// Page 01 start
doc.image(companyLogo, { width: 150, height: 40, align: 'left' });
doc.image(qrCode, 450, 60, { width: 60, height: 60 });

// Page 01 top customer information
doc.text('Subscription statement', 40, 110);
doc.text('To', 40, 130);
doc.text(customerInfo.companyName, 40, 150);
doc.text(customerInfo.address, 40, 167);
doc.text(customerInfo.city + ", " + customerInfo.state + ", " + customerInfo.country, 40, 184);
doc.text(customerInfo.vat, 40, 201);

// Page 01 summary table (left)
doc.font(fontBold).text('Details', 40, 250);
doc.font(font).text('User ID', 40, 267);
doc.text('Payment ID', 40, 284);
doc.text('Payment User Name', 40, 301);
doc.text('User Currency', 40, 318);

// Page 01 summary table (center)
doc.font(fontBold).text(customerInfo._id, 150, 267);
doc.text('6409933007dd7cac108d9cea', 150, 284);
doc.text(customerInfo.companyName, 150, 301);
doc.text('SAR', 150, 318);

// Page 01 summary table (right)
doc.font(fontBold).text('SKU Markets Subscription', 330, 250);
doc.font(font).text(`Summary for ${formattedDate}`, 330, 267);
doc.rect(325, 280, 250, 0.1).fill("#000").stroke("#000");
doc.text('Starting Balance', 330, 284);
doc.text('Total New Activities', 330, 301);
doc.text('Total Payments Received', 330, 318);
doc.rect(325, 331, 250, 0.1).fill("#000").stroke("#000");
doc.text('Ending Balance in', 330, 335);

doc.text(customerInfo?.currency + " " + prev_balance, 400, 284, { align: 'right' });
doc.text(customerInfo?.currency + " " + total_cost, 400, 301, { align: 'right' });
doc.text(customerInfo?.currency + " " + total_payment, 400, 318, { align: 'right' });
doc.text(customerInfo?.currency + " " + ending_balance, 400, 335, { align: 'right' });

// Page 01 Middle
doc.rect(40, 400, 560, 0.1).fill("#000").stroke("#000");
doc.text('This is not a bill', 40, 420);
doc.text('This is a summary of billing activity for the time period of stated above.', 40, 440);

// Page 1 bottom
doc.rect(15, 780, 560, 0.1).fill("#000").stroke("#000");
doc.fillColor("#0052FF").text('https://skumarkets.com', 40, 795, { goto: 'https://skumarkets.com', underline: true });
doc.fillColor("#000").text(sellerInfo.vat, 260, 795,);
doc.text('Have Questions?', 455, 790);

doc.text('support@skumarkets.com', 435, 800, { goto: 'mailto:support@skumarkets.com' });

doc.rect(15, 820, 560, 0.1).fill("#000").stroke("#000");


doc.addPage();

// Page 02 start
doc.image(companyLogo, { width: 150, height: 40, align: 'left' });
doc.image(qrCode, 450, 60, { width: 60, height: 60 });
doc.moveDown();

// ----------- Page 02 Invoice from Left
// doc.font(font).text('Invoice From', 40, 110);
// doc.text(sellerInfo.companyName, 40, 130);
// doc.text(sellerInfo.address, 40, 147);
// doc.text(sellerInfo.city + ", " + sellerInfo.state + ", " + sellerInfo.country , 40, 164);
// doc.text(sellerInfo.vat, 40, 181);

// ----------- Page 02 Invoice to right side
// doc.text('Invoice To', 380, 100);
// doc.text(customerInfo.companyName, 380, 130);
// doc.text(customerInfo.address, 380, 147);
// doc.text(customerInfo.city + ", " + customerInfo.state + ", " + customerInfo.country, 380, 164 );
// doc.text(sellerInfo.vat, 380, 181);

doc.font(fontBold).text('Subscription statement', 40, 110);
doc.font(font).text(customerInfo.companyName, 40, 127);
doc.text(`Summary for ${formattedDate}`, 40, 144);

// Page 02 Invoice date
// doc.text('Due Create', 40, 250);
// doc.text('17-03-2023', 40, 270);

// doc.text('Due Date', 380, 250);
// doc.text('05-04-2023', 380, 270);

// Page 02 Invoice table Heading
// doc.rect(15, 350, 560, 20).fill("#0052FF").stroke("#0052FF");
doc.rect(15, 250, 560, 0.1).fill('#000').stroke('#000');
doc.rect(15, 270, 560, 0.1).fill('#000').stroke('#000');
doc.text("#", 20, 257, { width: 20 });
doc.text("Description", 40, 257, { width: 240 });
doc.text("Plan Duration", 280, 257, { width: 80 });
doc.text("Plan Price", 360, 257, { width: 80 });
doc.text("VAT & Taxes", 440, 257, { width: 80 });
doc.text("Total", 520, 257, { width: 80 });


// Page 02 Invoice table body
let productNo = 1;
subscriptions.forEach(item=> {
let y = 280 + (productNo * 20);
doc.fillColor("#000").text(productNo, 20, y, { width: 20 });
doc.text(item?.plan, 40, y, { width: 240 });
doc.text(item?.plan_type, 285, y, { width: 80 });
doc.text(Number(item?.subscription_fees), 365, y, { width: 80 });
doc.text(Number(item?.vat_price), 445, y, { width: 80 });
doc.text(Number(item?.net_cost), 520, y, { width: 80 });
productNo++;
});

doc.rect(15, 300 + (productNo * 20), 560, 0.2).fillColor("#000").stroke("#000");
productNo++;


// Page 02 calculation
doc.text("Subtotal:", 320, 350 + (productNo * 20));
doc.text("Promotion:", 320, 367 + (productNo * 20));
doc.text(`Discount (${discount_rate}%):`, 320, 384 + (productNo * 20));
doc.text("Vat & Taxes:", 320, 401 + (productNo * 20));
doc.font(fontBold).text("Total:", 320, 418 + (productNo * 20));

doc.font(font).text(customerInfo?.currency + " " + net_cost, 470, 350 + (productNo * 20), { align: 'right' });
doc.text(customerInfo?.currency + " " + promotion, 470, 367 + (productNo * 20), { align: 'right' });
doc.text(customerInfo?.currency + " " + discount_price, 470, 384 + (productNo * 20), { align: 'right' });
doc.text(customerInfo?.currency + " " + vat_price, 470, 401 + (productNo * 20), { align: 'right' });
doc.font(fontBold).text(customerInfo?.currency + " " + total_cost, 470, 418 + (productNo * 20), { align: 'right' });

// Page 2 bottom
doc.rect(15, 780, 560, 0.1).fill("#000").stroke("#000");
doc.font(font).fillColor("#0052FF").text('https://skumarkets.com', 40, 795, { goto: 'https://skumarkets.com', underline: true });
doc.fillColor("#000").text(sellerInfo.vat, 260, 795,);
doc.text('Have Questions?', 455, 790);

doc.text('support@skumarkets.com', 435, 800, { goto: 'mailto:support@skumarkets.com' });

doc.rect(15, 820, 560, 0.1).fill("#000").stroke("#000");

doc.end();

};

module.exports = subscriptionInvoice;