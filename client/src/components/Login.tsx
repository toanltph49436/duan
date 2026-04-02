/* eslint-disable @typescript-eslint/no-explicit-any */
import logo from "../assets/logo.png";
import { useState } from "react";
import {
    AiOutlineLock,
    AiOutlineMail,
    AiTwotoneEye,
    AiTwotoneEyeInvisible,
} from "react-icons/ai";
import { Form, Input, message, type FormProps } from "antd";
import { useMutation } from "@tanstack/react-query";
import instanceClient from "../../configs/instance";
import type { AxiosError } from "axios";
import { FaSpinner } from "react-icons/fa";

type FieldType = {
    password: string;
    email: string;
};

interface LoginProps {
    onClose?: () => void;
    openRegister?: () => void;
    onLoginSuccess?: () => void;
}

const Login = ({ onClose = () => { }, openRegister = () => { }, onLoginSuccess = () => { } }: LoginProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: any) => {
            try {
                const response = await instanceClient.post("/login", data);

                // giả lập delay 1.5s
                await new Promise((resolve) => setTimeout(resolve, 1500));

                if (response.status !== 200 && response.status !== 201) {
                    return messageApi.open({
                        type: "error",
                        content: "Bạn đăng nhập thất bại",
                        duration: 2,
                    });
                }

                const { accessToken, username, userId } = response.data;
                if (accessToken) {
                    localStorage.setItem("token", accessToken);
                    localStorage.setItem("user", username);
                    localStorage.setItem("userId", userId);
                    onLoginSuccess();
                    onClose();
                }
            } catch (error: unknown) {
                const err = error as AxiosError<{ messages: string[] }>;
                const errorMessages = err?.response?.data?.messages;

                messageApi.open({
                    type: "error",
                    content: errorMessages?.[0] || "Đã có lỗi xảy ra",
                    duration: 3,
                });
                throw new Error("error");
            }
        },
    });

    const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
        mutate(values);
    };

    return (
        <>
            {contextHolder}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white relative text-gray-600 w-full max-w-[450px] md:p-8 p-6 rounded-2xl shadow-xl animate-fadeIn">
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-black"
                    >
                        &times;
                    </button>

                    {/* Logo */}
                    <img src={logo} alt="Logo" className="h-16 mx-auto mb-3" />

                    {/* Title */}
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                        Chào mừng đến với{" "}
                        <span className="text-indigo-600">Elite Travel</span>
                    </h2>



                    {/* Form */}
                    <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
                        {/* Email */}
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email", message: "Email không hợp lệ" },
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();
                                        const allowedDomains = [
                                            "gmail.com",
                                            "yahoo.com",
                                            "outlook.com",
                                            "hotmail.com",
                                            "icloud.com"
                                        ];
                                        const domain = value.split("@")[1]?.toLowerCase();
                                        if (!domain || !allowedDomains.includes(domain)) {
                                            return Promise.reject(new Error("Email phải sử dụng domain hợp lệ (gmail.com, yahoo.com, outlook.com, hotmail.com, icloud.com)"));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input
                                prefix={<AiOutlineMail className="text-gray-400" />}
                                placeholder="Email"
                                size="large"
                                disabled={isPending}
                                className="rounded-full"
                            />
                        </Form.Item>

                        {/* Password */}
                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: "Vui lòng nhập mật khẩu" }
                            ]}
                        >
                            <Input
                                prefix={<AiOutlineLock className="text-gray-400" />}
                                type={showPassword ? "text" : "password"}
                                placeholder="Mật khẩu"
                                size="large"
                                disabled={isPending}
                                className="rounded-full"
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-500 hover:text-black"
                                    >
                                        {showPassword ? (
                                            <AiTwotoneEye className="text-lg" />
                                        ) : (
                                            <AiTwotoneEyeInvisible className="text-lg" />
                                        )}
                                    </button>
                                }
                            />
                        </Form.Item>

                        {/* Forgot password */}
                        <div className="text-right pb-3">
                            <a
                                className="text-indigo-600 hover:underline text-sm"
                                href="#"
                            >
                                Quên mật khẩu?
                            </a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full mt-1 mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 py-3 rounded-full text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
                            disabled={isPending}
                        >
                            {isPending && <FaSpinner className="animate-spin text-white" />}
                            {isPending ? "Đang đăng nhập..." : "Đăng Nhập"}
                        </button>
                    </Form>

                    {/* Switch to register */}
                    <p className="text-center text-sm">
                        Bạn chưa có tài khoản?{" "}
                        <button
                            onClick={openRegister}
                            className="text-indigo-600 font-medium hover:underline"
                        >
                            Đăng Ký
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;
