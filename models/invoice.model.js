const mongoose = require("mongoose");

const invoiceSchema = mongoose.Schema(
	{	

		invoice_id: {
			type: String,
			default: "INV-12345678",
			unique: true,
		},

		userId: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
		},

		purpose: {
			type: String,
			enum: {
				values: ["subscription", "ads"],
				message: "purpose should be subscription, or ads"
			}
		},

		issue_date: {
			type: Date,
			default: Date.now(),
		},

		companyName: {
			type: String,
		},

		payment_id: {
			type: String,
			default: 123456,
		},

		document_type: {
			type: String,
			default: 'Statement',
		},

		currency: {
			type: String,
			default: "SAR",
		},

		amount: {
			type: Number,
			default: 0,
		},

		url: {
			type: String,
			default: 'https://skumarkets.com',
		},

	},
	{ timestamps: true }
);

invoiceSchema.pre('save', function (next) {

  if (this.isNew){
  	// here the code before creating
  }
   
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
