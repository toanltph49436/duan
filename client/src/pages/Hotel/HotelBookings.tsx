import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import instanceClient from '../../../configs/instance';

type Location = {
  locationName?: string;
  country?: string;
};

type Hotel = {
  _id: string;
  hotelName?: string;
  address?: string;
  starRating?: number;
  hotelImages?: string[];
  location?: Location;
};

type Booking = {
  _id: string;
  hotelId: Hotel;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  totalGuests: number;
  totalPrice: number;
  payment_status: string;
  createdAt: string;
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const currency = (n?: number) =>
  typeof n === 'number' ? n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '';

const HotelBookings = () => {
  const userId = localStorage.getItem('userId');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['hotel-bookings', userId],
    queryFn: async () => {
      if (!userId) throw new Error('Bạn cần đăng nhập');
      const res = await instanceClient.get(`/hotel-booking/user/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  const bookings: Booking[] = useMemo(() => data?.bookings || [], [data]);

  if (!userId) {
    return <div className="max-w-5xl mx-auto p-4">Vui lòng đăng nhập để xem đặt phòng khách sạn.</div>;
  }

  if (isLoading) return <div className="max-w-5xl mx-auto p-4">Đang tải...</div>;
  if (isError) return <div className="max-w-5xl mx-auto p-4">Có lỗi xảy ra khi tải dữ liệu.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Đặt phòng khách sạn của tôi</h1>
      {bookings.length === 0 ? (
        <div>Chưa có đặt phòng nào.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((b) => (
            <div key={b._id} className="border rounded-lg p-4 shadow-sm bg-white">
              <div className="flex gap-4">
                {b.hotelId?.hotelImages?.[0] && (
                  <img
                    src={b.hotelId.hotelImages[0]}
                    alt={b.hotelId?.hotelName || 'Hotel'}
                    className="w-28 h-28 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">{b.hotelId?.hotelName || 'Khách sạn'}</h2>
                    <span className="text-sm px-2 py-1 rounded bg-gray-100">{b.payment_status}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {b.hotelId?.location?.locationName && (
                      <span>{b.hotelId.location.locationName}{b.hotelId?.location?.country ? `, ${b.hotelId.location.country}` : ''}</span>
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <div>Nhận phòng: {formatDate(b.checkInDate)} - Trả phòng: {formatDate(b.checkOutDate)}</div>
                    <div>Số đêm: {b.numberOfNights} • Khách: {b.totalGuests}</div>
                  </div>
                  <div className="mt-2 font-semibold">Tổng tiền: {currency(b.totalPrice)}</div>
                  <div className="text-xs text-gray-500 mt-1">Đặt lúc: {formatDate(b.createdAt)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelBookings;


