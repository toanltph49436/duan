import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Spin, Typography } from "antd";
import instance from "../configs/axios";

const { Text } = Typography;

const SyncUserToBackend: React.FC = () => {
    const { isSignedIn, user } = useUser();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isSignedIn || !user) return;

        const sendUserToBackend = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                if (!token) {
                    console.warn("No auth token available");
                    setLoading(false);
                    return;
                }

                const userData = {
                    clerkId: user.id,
                    email:
                        user.primaryEmailAddress?.emailAddress ||
                        user.emailAddresses?.[0]?.emailAddress ||
                        "",
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                };


                try {
                    await instance.post("/syncUser", userData, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    console.log("User synced to backend successfully");
                } catch (syncError) {
                    console.warn("Could not sync user to backend, but continuing anyway:", syncError);
                    // Không dừng luồng xử lý nếu đồng bộ thất bại
                }
            } catch (error) {
                console.error("Error syncing user to backend:", error);
            } finally {
                setLoading(false);
            }
        };

        sendUserToBackend();
    }, [isSignedIn, user, getToken]);

    if (loading) {
        return (
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 9999,
                    textAlign: "center",
                }}
            >
                <Spin size="large" />
                <Text style={{ marginTop: 16, display: "block", color: "#555" }}>
                    Đang đồng bộ người dùng...
                </Text>
            </div>
        );
    }

    return null;
};

export default SyncUserToBackend;
