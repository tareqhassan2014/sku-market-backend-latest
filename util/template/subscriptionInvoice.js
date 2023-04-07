const pdfKit = require('pdfkit');
const fs = require('fs');

const subscriptionInvoice = ({invoice_id}) => {

let companyLogo = "upload/cover/cover.jpg";
let smallLogo = "upload/avatar/avatar.jpg";
let fileName = `upload/docs/${invoice_id}.pdf`;

let sellerInfo = {
"companyName": "ALARDH ALMUTQEN FOR TRS EST",
"address": "7260 King Abdulaziz St 4820",
"city": "Al Rabi District",
"state": "Riyadh",
"country": "Saudi Arabia",
"vat": 310102316300003,
"zipCode": "400017",
"contactNo": "+910000000600"
}

let customerInfo = {
"companyName": "Customer ABC",
"address": "38/6 Sarulia",
"city": "Demra",
"state": "Dhaka",
"country": "Bangladesh",
"vat": 310102316300003,
"zipCode": "400054",
"contactNo": "+910000000787"
}

let orderInfo = {
	"orderNo": "15484659",
	"invoiceNo": "MH-MU-1077",
	"invoiceDate": "11/05/2021",
	"invoiceTime": "10:57:00 PM",
	"products": [
		{
			"id": "1",
			"description": "B2C Partner Stores",
			"plan_duration": "Monthly",
			"plan_price": 39999,
			"vat_price": 452,
		},
		{
			"id": "1",
			"description": "Data Analytics",
			"plan_duration": "Monthly",
			"plan_price": 49999,
			"vat_price": 852,
		},
		
	],
	"totalValue": 45997
}

let doc = new pdfKit({
	margins: { top: 30, left: 40, right: 40, bottom: 20 },
  size: 'A4',
  layout: 'portrait'
});


let stream = fs.createWriteStream(fileName);
doc.pipe(stream);

doc.fontSize(10);

doc.image(companyLogo, { width: 150, height: 40, align: 'left' });
doc.image(smallLogo, 380, 30, { width: 60, height: 60 });
doc.moveDown();

doc.text('Invoice From', 40, 100);
doc.text(sellerInfo.companyName, 40, 130);
doc.text(sellerInfo.address, 40, 147);
doc.text(sellerInfo.city + ", " + sellerInfo.state + ", " + sellerInfo.country , 40, 164);
doc.text(sellerInfo.vat, 40, 181);

doc.text('Invoice To', 380, 100);
doc.text(customerInfo.companyName, 380, 130);
doc.text(customerInfo.address, 380, 147);
doc.text(customerInfo.city + ", " + customerInfo.state + ", " + customerInfo.country, 380, 164 );
doc.text(sellerInfo.vat, 380, 181);

doc.text('Due Create', 40, 250);
doc.text('17-03-2023', 40, 270);

doc.text('Due Date', 380, 250);
doc.text('05-04-2023', 380, 270);

doc.rect(15, 350, 560, 20).fill("#0052FF").stroke("#0052FF");
doc.fillColor("#fff").text("#", 20, 355, { width: 10 });
doc.text("Description", 30, 355, { width: 250 });
doc.text("Plan Duration", 280, 355, { width: 80 });
doc.text("Plan Price", 360, 355, { width: 80 });
doc.text("VAT & Taxes", 440, 355, { width: 80 });
doc.text("Total", 520, 355, { width: 80 });

let productNo = 1;
orderInfo.products.forEach(item=> {
let y = 380 + (productNo * 20);
doc.fillColor("#000").text(item.id, 20, y, { width: 10 });
doc.text(item.description, 30, y, { width: 250 });
doc.text(item.plan_duration, 280, y, { width: 80 });
doc.text(item.plan_price, 360, y, { width: 80 });
doc.text(item.vat_price, 440, y, { width: 80 });
doc.text(Number(item.plan_price) + Number(item.vat_price), 520, y, { width: 80 });
productNo++;
});

doc.rect(15, 400 + (productNo * 20), 560, 0.2).fillColor("#000").stroke("#000");
productNo++;

doc.text("Subtotal:", 320, 450 + (productNo * 20));
doc.text("Promotion:", 320, 467 + (productNo * 20));
doc.text("Discount (20%):", 320, 484 + (productNo * 20));
doc.text("Vat & Taxes:", 320, 501 + (productNo * 20));
doc.text("Total:", 320, 518 + (productNo * 20));

doc.text("SAR 250", 470, 450 + (productNo * 20));
doc.text("SAR 50", 470, 467 + (productNo * 20));
doc.text("SAR 20", 470, 484 + (productNo * 20));
doc.text("37.5", 470, 501 + (productNo * 20));
doc.text("SAR 350", 470, 518 + (productNo * 20));


doc.end();

};

module.exports = subscriptionInvoice;