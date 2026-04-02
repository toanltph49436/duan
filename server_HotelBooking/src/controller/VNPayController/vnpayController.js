// const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

// // Tạo URL thanh toán VNPay
// const createVNPayPaymentUrl = async (paymentData) => {
//     try {
//         // Cấu hình VNPay
//         const vnpay = new VNPay({
//             tmnCode: 'LH54Z11C',
//             secureSecret: 'PO0WDG07TJOGP1P8SO6Z9PHVPIBUWBGQ',
//             vnpayHost: 'https://sandbox.vnpayment.vn',
//             testMode: true,
//             hashAlgorithm: 'SHA512',
//             loggerFn: ignoreLogger,
//         });

//         const tomorrow = new Date();
//         tomorrow.setDate(tomorrow.getDate() + 1);

//         // Tạo URL thanh toán
//         const paymentUrl = await vnpay.buildPaymentUrl({
//             vnp_Amount: paymentData.amount * 100, // VNPay yêu cầu số tiền tính bằng xu
//             vnp_IpAddr: paymentData.ipAddr || '127.0.0.1',
//             vnp_TxnRef: `${paymentData.bookingId}-${Date.now()}`,
//             vnp_OrderInfo: paymentData.orderInfo,
//             vnp_OrderType: ProductCode.Other,
//             vnp_ReturnUrl: paymentData.returnUrl || `http://localhost:8080/api/vnpay/payment-callback`,
//             vnp_Locale: paymentData.locale === 'en' ? VnpLocale.EN : VnpLocale.VN,
//             vnp_CreateDate: dateFormat(new Date()),
//             vnp_ExpireDate: dateFormat(tomorrow),
//         });

//         return paymentUrl;
//     } catch (error) {
//         console.error('Lỗi tạo VNPay URL:', error);
//         throw error;
//     }
// };

// module.exports = {
//     createVNPayPaymentUrl
// };