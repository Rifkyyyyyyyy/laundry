const midtransClient = require('midtrans-client');

const snapApi = new midtransClient.Snap({
    isProduction: false, 
    serverKey: process.env.MIDTRANS_SERVER_KEY, 
    clientKey: process.env.MIDTRANS_CLIENT_KEY 
});

module.exports = {
    snapApi
}