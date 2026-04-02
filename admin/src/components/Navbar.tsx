import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

import { useUser, UserButton, useAuth } from "@clerk/clerk-react";
import { useQuery } from '@tanstack/react-query';
import { instanceAdmin } from '../configs/axios';
import { BellOutlined } from '@ant-design/icons';

const Navbar = () => {
    const { isSignedIn, user } = useUser();

    const { getToken } = useAuth();

    // Lấy thống kê booking để hiển thị thông báo
    const { data: bookingStats, refetch } = useQuery({
        queryKey: ['booking-stats'],

        queryFn: async () => {
            try {
                const token = await getToken();
                if (!token) {
                    console.warn("No auth token available");
                    return { data: { stats: { pendingCancel: 0 } } };
                }
                
                const response = await instanceAdmin.get('/admin/bookings/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return response;
            } catch (error) {
                console.error('Error fetching booking stats:', error);
                return { data: { stats: { pendingCancel: 0 } } };
            }
        },
        refetchInterval: 30000, // Cập nhật mỗi 30 giây
        staleTime: 0, // Luôn coi data là stale để cập nhật ngay
        refetchOnWindowFocus: true, // Refetch khi focus lại window
        retry: false // Không retry nếu lỗi
    });

    const pendingCancelCount = bookingStats?.data?.stats?.pendingCancel || 0;

    return (
        <div className="flex items-center justify-between px-6  bg-blue-200 shadow-sm border-b border-gray-200">
            {/* Logo */}
            <Link to="/admin/dashboad" className="flex items-center gap-2">
                <img src={logo} alt="Logo" className="h-16 ml-20" />
            </Link>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {isSignedIn ? (
                    <>
                        {/* Thông báo booking cần xử lý */}
                        {pendingCancelCount > 0 && (
                            <Link to="/admin/list-booking" className="relative">
                                <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200">
                                    <BellOutlined style={{ fontSize: '16px' }} />
                                    <span className="text-sm font-medium">
                                        {pendingCancelCount} đặt chỗ cần xử lý
                                    </span>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {pendingCancelCount}
                                    </div>
                                </div>
                            </Link>
                        )}

                        <span className="text-sm font-medium text-gray-700">
                            Hi, {user?.firstName || user?.username}
                        </span>

                        {/* Dùng UserButton của Clerk để hiện ảnh user và popup */}
                        <UserButton afterSignOutUrl="/admin" />
                    </>
                ) : (
                    <Link to="/admin">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 rounded-full transition duration-200">
                            Login
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Navbar;
