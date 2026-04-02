import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Modal, Typography } from "antd";

const { Title } = Typography;

interface AdminRouteProps {
    children: React.ReactNode;
}

const allowedAdminEmail = ["toanltph49436@gmail.com","test@gmail.com","tienmin@gmail.com ","huyquoc2xx4@gmail.com tour@gmail.com"];

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isLoaded } = useUser();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (!isLoaded) return;

        const currentEmail = user?.emailAddresses?.[0]?.emailAddress;

        if (!user) {
            navigate("/login", { replace: true });
            return;
        }

        if (currentEmail && allowedAdminEmail.includes(currentEmail)) {
            if (location.pathname === "/admin") {
                navigate("/admin/dashboad", { replace: true });
            }
        } else {
            setModalVisible(true);
            const timer = setTimeout(async () => {
                setModalVisible(false);
                await signOut();
                navigate("/login", { replace: true });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isLoaded, user, signOut, navigate, location.pathname]);

    if (!isLoaded) return null;

    // Nếu đúng admin thì render children (nếu chưa redirect kịp)
    const currentEmail = user?.emailAddresses?.[0]?.emailAddress;
    if (currentEmail && allowedAdminEmail.includes(currentEmail)) {
        return <>{children}</>;
    }

    // Hiện modal nếu email không đúng
    return (
        <Modal
            visible={modalVisible}
            footer={null}
            closable={false}
            centered
            maskStyle={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            bodyStyle={{ textAlign: "center", padding: 50 }}
        >
            <Title style={{ color: "#ff4d4f", fontSize: 36 }}>
                Bạn không có quyền truy cập
            </Title>
            <p style={{ fontSize: 18, color: "#ff4d4f" }}>
                Trang này chỉ dành cho admin được phép
            </p>
        </Modal>
    );
};

export default AdminRoute;
