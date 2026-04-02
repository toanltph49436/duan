import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

function PaymentResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed'>('processing');
    const [messageText, setMessageText] = useState<string>('');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const responseCode = params.get("vnp_ResponseCode");
        const success = params.get("success");
        const messageParam = params.get("message");

        if (success === "true" || responseCode === "00") {
            setPaymentStatus('success');
            setMessageText(messageParam || "Thanh toán thành công!");
        } else {
            setPaymentStatus('failed');
            setMessageText(messageParam || "Đã có lỗi xảy ra trong quá trình thanh toán.");
        }

        // Đếm ngược và chuyển hướng về trang chủ
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [location, navigate]);

    const handleGoHome = () => {
        navigate("/");
    };

    if (paymentStatus === 'processing') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Đang xử lý kết quả thanh toán...</h2>
                    <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                {paymentStatus === 'success' ? (
                    <>
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h2>
                        <p className="text-gray-600 mb-6">{messageText}</p>
                    </>
                ) : (
                    <>
                        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại!</h2>
                        <p className="text-gray-600 mb-6">{messageText}</p>
                    </>
                )}

                <div className="space-y-3">
                    <button
                        onClick={handleGoHome}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                    >
                        Về trang chủ
                    </button>

                    <p className="text-sm text-gray-500">
                        Tự động chuyển về trang chủ sau {countdown} giây
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PaymentResult;
