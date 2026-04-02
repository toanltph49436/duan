import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type SidebarLink = {
    name: string;
    path?: string;
    icon?: string;
    children?: { name: string; path: string; icon?: string }[];
};

const Sidebar = () => {
    const location = useLocation();
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const toggleMenu = (index: number) => {
        setOpenMenuIndex(prevIndex => (prevIndex === index ? null : index));
    };

    const sidebarLinks: SidebarLink[] = [
        { name: 'Hệ Thống', path: '/admin/dashboad', icon: '💻' },
        {
            name: 'Các Chuyến Tham Quan',
            icon: '🧭',
            children: [
                { name: 'Danh sách Các Chuyến Tham Quan', path: '/admin/list-tour', icon: '📋' },
                { name: 'Thêm Các Chuyến Tham Quan', path: '/admin/add-tour', icon: '🆕' },
            ],
        },
        {
            name: 'Lịch Trình Các Chuyến Tham Quan',
            icon: '🗓️',
            children: [
                { name: 'Danh sách Lịch Trình Các Chuyến Tham Quan', path: '/admin/list-tourschedule', icon: '📅' },
                { name: 'Thêm Lịch Trình Các Chuyến Tham Quan', path: '/admin/add-tourschedule', icon: '✍️' },
            ],
        },
        {
            name: 'Quản lý đặt chỗ',
            icon: '📋',
            children: [
                { name: 'Danh sách đặt chỗ', path: '/admin/list-booking', icon: '📊' },

                { name: 'Quản lý hoàn tiền', path: '/admin/refund-management', icon: '💰' },
            ],
        },
        {
            name: 'Thống kê Tour',
            icon: '📈',
            children: [
                { name: 'Tour sắp diễn ra', path: '/admin/tour-status/upcoming', icon: '🔜' },
                { name: 'Tour đang diễn ra', path: '/admin/tour-status/ongoing', icon: '🔄' },
                { name: 'Tour đã hoàn thành', path: '/admin/tour-status/completed', icon: '✅' },
            ],
        },
        {
            name: 'Quản lý Blog',
            icon: '📝',
            children: [
                { name: 'Danh sách Blog', path: '/admin/list-blog', icon: '📋' },
                { name: 'Thêm Blog', path: '/admin/add-blog', icon: '✍️' },
            ],
        },
        {
            name: 'Quản lý Thời Gian Tour',
            icon: '⏱️',
            children: [
                { name: 'Danh sách Thời Gian Tour', path: '/admin/list-time', icon: '📋' },
                { name: 'Thêm Thời Gian Tour', path: '/admin/add-timetour', icon: '✍️' },
            ],
        },

        {
            name: 'Quản lý Khách sạn',
            icon: '🏨',
            children: [
                { name: 'Danh sách Khách sạn', path: '/admin/hotels', icon: '🏢' },
                { name: 'Thêm Khách sạn', path: '/admin/hotels/add', icon: '🆕' },
                { name: 'Quản lý Phòng', path: '/admin/room-management', icon: '🛏️' },
                { name: 'Quản lý Đặt phòng', path: '/admin/hotel-bookings', icon: '📋' },
                { name: 'Quản lý Tiện ích', path: '/admin/amenity-management', icon: '⚙️' },
            ],
        },

        {
            name: 'Quản lý Phương tiện',
            icon: '🚌',
            children: [
                { name: 'Danh sách Phương tiện', path: '/admin/list-transport', icon: '📋' },
                { name: 'Thêm Phương tiện', path: '/admin/add-transport', icon: '🆕' },
            ],
        },

        {
            name: 'Quản lý Tài Khoản',
            icon: '👥',
            children: [
                { name: 'Tài khoản Khách hàng', path: '/admin/customer-accounts', icon: '👤' },
                { name: 'Tài khoản nhân viên', path: '/admin/employee-accounts', icon: '🧑‍🏫' },
                { name: 'Phân công HDV', path: '/admin/employee-assignment', icon: '📋' },
                { name: 'Phân công quản lý khách sạn', path: '/admin/hotel-assignment', icon: '🏨' },
            ],
        },
    ];

    return (
        <div
            className={`h-screen bg-white/150 backdrop-blur-sm text-gray-900 transition-all duration-300 ease-in-out 
  ${collapsed ? 'w-20' : 'w-72'} flex flex-col shadow-lg`}
        >
            <div className="p-3 flex justify-end">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hover:scale-110 transform duration-200"
                    title="Toggle Sidebar"
                >
                    {collapsed ? '➡️' : '⬅️'}
                </button>
            </div>

            <nav
                className="flex flex-col gap-1 px-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                style={{ maxHeight: 'calc(100vh - 86px)' }}
            >
                {sidebarLinks.map((link, index) => (
                    <div key={index}>
                        {link.children ? (
                            <div
                                onClick={() => toggleMenu(index)}
                                className={`flex items-center justify-between gap-3 px-3 py-2 cursor-pointer rounded-lg 
                                    transition-all hover:bg-white/20 ${openMenuIndex === index ? 'bg-white/30 font-semibold' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{link.icon}</span>
                                    {!collapsed && <span>{link.name}</span>}
                                </div>
                                {!collapsed && (
                                    <span className="text-sm">{openMenuIndex === index ? '▲' : '▼'}</span>
                                )}
                            </div>
                        ) : (
                            link.path && (
                                <Link
                                    to={link.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                                        hover:bg-white/20 ${location.pathname === link.path ? 'bg-white/30 font-semibold' : ''}`}
                                >
                                    <span className="text-lg">{link.icon}</span>
                                    {!collapsed && <span>{link.name}</span>}
                                </Link>
                            )
                        )}

                        {link.children && openMenuIndex === index && (
                            <div className="ml-8 flex flex-col gap-1 mt-1">
                                {link.children.map((child, childIndex) => (
                                    <Link
                                        key={childIndex}
                                        to={child.path}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all
                                            hover:bg-white/20 ${location.pathname === child.path
                                                ? 'bg-white/40 text-pink-600 font-semibold'
                                                : ''}`}
                                    >
                                        <span>{child.icon}</span>
                                        {!collapsed && <span>{child.name}</span>}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
