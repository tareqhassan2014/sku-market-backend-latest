const Invoice = require("../../models/invoice.model");
const catchAsyncErrors = require("../catchAsyncErrors");
const AppError = require("../appError");
const crypto = require("crypto");
const subscriptionInvoice = require("./subscriptionInvoice");
const User = require("../../models/user.model");

const fs = require("fs");
const { bucket, bucketName, bucketUpload } = require("../../lib/googleBucket");

const createInvoice = async (subscriptionInfo, userId) => {
try {
	const randomNumber = crypto.randomBytes(4).toString('hex');
  const invoice_id = 'INV-'+randomNumber;
  
  const user = await User.findById(userId);

  const fileName = `${invoice_id}-${user._id}-${Date.now()}.pdf`;
  const filePath = `./upload/docs/${fileName}`;

  const data = {
  	invoice_id,
  	userId,
  	amount: subscriptionInfo?.total_amount,
  	purpose: 'subscription',
  	companyName: user?.companyName,
  	currency: user.defaultCurrency?.label,
  	document_type: 'Subscription Statement',
  };

  const customerInfo = {
  	_id: user?._id,
		companyName: user?.companyName,
		address: user?.address,
		city: user?.city,
		state: user?.state,
		country: user?.country,
		zipCode: user?.zipCode,
		phone: user?.phone,
		currency: user?.defaultCurrency?.label,
		vat: user?.docs?.vat?.value || '',
	}

	const invoiceData = new Invoice(data);

  await subscriptionInvoice({
  	invoice_id,
  	customerInfo,
  	subscriptionInfo,
  	filePath,
  });


  await invoiceData.save();

 	// Uploads a local file to the bucket
  const { url } = await bucketUpload(filePath, `invoices/${fileName}`);

  // Deleting local file
  await fs.unlinkSync(filePath);

  invoiceData.url = url;
  await invoiceData.save();

} catch(err) {
	console.log(err);
}};

module.exports = createInvoice;