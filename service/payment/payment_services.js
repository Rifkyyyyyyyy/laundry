const crypto = require('crypto');
const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');

const {
    snapApi
} = require('../../midtrans');

const createPaymentServices = async (product_name, gross_amount, customer_name, customer_email, customer_phone, payment_method, description) => {
    try {

        if (!customer_phone || !customer_name || !customer_email) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Customer name, phone, and email are required');
        }

        const order_id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const hash = crypto.createHash("md5").update(product_name).digest("hex");
        const product_number = `P-${parseInt(hash, 16) % 1e12}`;


        const payload = {
            transaction_details: {
              order_id: order_id,
              gross_amount: Number(gross_amount)
            },
            item_details: [{
              id: product_number,
              price: Number(gross_amount),
              quantity: 1,
              name: product_name
            }],
            customer_details: {
              first_name: customer_name,
              email: customer_email,
              phone: customer_phone
            },
            enabled_payments: payment_method === 'bank_transfer' ? [
              'bank_transfer',
              'bca_va',
              'bni_va',
              'bri_va',
              'permata_va',
              'echannel',
              'other_va'
            ] : undefined,
            description: description
          };
          
    
        const transaction = await snapApi.createTransaction(payload);

        return transaction;
    } catch (error) {
        console.error('Error processing payment:', error);
        throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Error processing the payment');
    }
};

const updatePaymentServices = async () => {

}

module.exports = {
    createPaymentServices
}