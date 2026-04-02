
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import axiosGuide from "../../config/axios";

// Component Accordion cho lịch trình tour (only from schedules)
const TourScheduleAccordion = ({ schedules }) => {
  const [openDays, setOpenDays] = useState({ 0: true }); // Mở ngày đầu tiên mặc định
  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    console.log('TourScheduleAccordion received schedules:', schedules);
    if (schedules && schedules.length > 0) {
      // Sử dụng data từ TourSchedule API
      parseScheduleFromAPI(schedules);
    } else {
      // Nếu không có data gì, hiển thị thông báo
      setScheduleData([]);
    }
  }, [schedules]);

  const parseScheduleFromAPI = (apiSchedules) => {
    try {
      console.log("Parsing schedule from API:", apiSchedules);

      const formattedSchedules = apiSchedules.map((schedule, index) => ({
        day: parseInt(schedule.dayNumber) || (index + 1),
        title: schedule.location || `Ngày ${schedule.dayNumber}`,
        content: schedule.activity || 'Không có thông tin hoạt động',
        images: schedule.imageTourSchedule || [],
        isExpanded: index === 0 // Mở ngày đầu tiên
      }));

      setScheduleData(formattedSchedules);

      // Mở TẤT CẢ các ngày mặc định
      if (formattedSchedules.length > 0) {
        const allOpen = formattedSchedules.reduce((acc, _item, idx) => {
          acc[idx] = true;
          return acc;
        }, {});
        setOpenDays(allOpen);
      }

      console.log("Formatted schedules:", formattedSchedules);
    } catch (error) {
      console.error('Error parsing API schedule:', error);
      setScheduleData([]);
    }
  };

  // Removed parsing from description to avoid mixing with overview content

  const toggleDay = (index) => {
    setOpenDays(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getDayColor = (dayNumber) => {
    const colors = [
      'bg-red-500', // Ngày 1
      'bg-blue-500', // Ngày 2
      'bg-green-500', // Ngày 3
      'bg-orange-500', // Ngày 4
      'bg-purple-500', // Ngày 5
      'bg-pink-500', // Ngày 6
      'bg-indigo-500', // Ngày 7
      'bg-yellow-500', // Ngày 8
    ];
    return colors[(dayNumber - 1) % colors.length];
  };

  if (scheduleData.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thông tin lịch trình</h3>
          <p className="text-gray-500">Lịch trình chi tiết sẽ được cập nhật sớm nhất.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scheduleData.map((dayInfo, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {/* Header - Clickable */}
          <button
            onClick={() => toggleDay(index)}
            className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left"
          >
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center justify-center w-8 h-8 ${getDayColor(dayInfo.day)} text-white rounded-full text-sm font-bold`}>
                {dayInfo.day}
              </span>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold text-gray-900">
                  Ngày {dayInfo.day}: {dayInfo.title}
                </span>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${openDays[index] ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Content - Collapsible */}
          {openDays[index] && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="space-y-4">
                {/* Hoạt động trong ngày */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Hoạt động trong ngày
                  </h4>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4">
                    {dayInfo.content}
                  </div>
                </div>

                {/* Ảnh minh họa */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Hình ảnh minh họa
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dayInfo.images && dayInfo.images.length > 0 ? (
                      dayInfo.images.slice(0, 3).map((image, imgIndex) => (
                        <div key={imgIndex} className="aspect-video rounded-lg overflow-hidden border">
                          <img
                            src={image}
                            alt={`${dayInfo.title} - Ảnh ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjEwMCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFuaCBsb2k8L3RleHQ+PC9zdmc+';
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      // Placeholder khi không có ảnh
                      Array.from({ length: 3 }, (_, imgIndex) => (
                        <div key={imgIndex} className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <div className="text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-400 text-sm">Ảnh minh họa</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const TourDuocGiao = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [customerBookings, setCustomerBookings] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [updatingTours, setUpdatingTours] = useState({}); // Track which tours are being updated
  const [tourDateSlots, setTourDateSlots] = useState({}); // Track dateSlots for each tour
  // removed create-slot modal state
  const [creatingForTour, setCreatingForTour] = useState(null);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotSeats, setNewSlotSeats] = useState(25);
  const { user } = useAuth();

  useEffect(() => {
    fetchAssignedTours();
  }, []);

  const fetchAssignedTours = async () => {
    try {
      setLoading(true);
      const response = await axiosGuide.get("employee/assigned-tours");

      console.log("Assigned tours response:", response.data);
      console.log("Raw API response tours:", JSON.stringify(response.data.tours, null, 2));

      if (response.data.success) {
        console.log("Tours data:", response.data.tours);
        const toursData = response.data.tours;

        // Sử dụng assignedDates từ API response thay vì lấy tất cả dateSlots
        const dateSlotsData = {};
        for (const tour of toursData) {
          console.log(`Processing tour ${tour._id}:`, {
            name: tour.nameTour,
            assignedDates: tour.assignedDates
          });

          if (tour.assignedDates && tour.assignedDates.length > 0) {
            // Chỉ hiển thị những ngày được phân công với đầy đủ thông tin
            dateSlotsData[tour._id] = tour.assignedDates.map(assignedDate => ({
              _id: assignedDate.dateSlotId,
              dateTour: assignedDate.dateTour,
              tourStatus: assignedDate.tourStatus,
              status: assignedDate.status,
              availableSeats: assignedDate.availableSeats,
              bookedSeats: assignedDate.bookedSeats,
              totalRevenue: assignedDate.totalRevenue,
              depositAmount: assignedDate.depositAmount,
              refundAmount: assignedDate.refundAmount,
              statusNote: assignedDate.statusNote,
              statusUpdatedAt: assignedDate.statusUpdatedAt
            }));
            console.log(`Tour ${tour._id} dateSlots:`, dateSlotsData[tour._id]);
          } else {
            console.log(`Tour ${tour._id} has no assignedDates. Fallback: fetch DateSlots by tourId and filter by assignedEmployee`);
            try {
              const slotResp = await axiosGuide.get(`date/tour/${tour._id}`);
              const employeeId = user?.employeeId || user?.id || user?.employee_id;
              const raw = slotResp?.data;
              const list = Array.isArray(raw?.dates)
                ? raw.dates
                : Array.isArray(raw)
                  ? raw
                  : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.dateSlots) ? raw.dateSlots : []));
              const slots = Array.isArray(list)
                ? list.filter((s) => {
                  const assigned = s.assignedEmployee;
                  return assigned === employeeId || (assigned && assigned._id === employeeId);
                })
                : [];
              if (slots.length > 0) {
                dateSlotsData[tour._id] = slots.map(s => ({
                  _id: s._id,
                  dateTour: s.dateTour,
                  tourStatus: s.tourStatus || 'preparing',
                  status: s.status || 'active',
                  availableSeats: s.availableSeats,
                  bookedSeats: s.bookedSeats || 0,
                  totalRevenue: s.totalRevenue || 0,
                  depositAmount: s.depositAmount || 0,
                  refundAmount: s.refundAmount || 0,
                  statusNote: s.statusNote || '',
                  statusUpdatedAt: s.statusUpdatedAt || s.updatedAt
                }));
                console.log(`Tour ${tour._id} dateSlots via fallback:`, dateSlotsData[tour._id]);
              } else {
                // Vẫn không có slot phân công cho HDV này -> giữ trống để hiển thị nút tạo slot
                dateSlotsData[tour._id] = [];
              }
            } catch (e) {
              console.warn('Fallback fetch DateSlots error for tour', tour._id, e);
              dateSlotsData[tour._id] = [];
            }
          }
        }

        console.log('Final dateSlotsData:', dateSlotsData);
        setTourDateSlots(dateSlotsData);
        setTours(toursData);

        // Debug log sau khi set state
        setTimeout(() => {
          console.log('tourDateSlots state after setting:', dateSlotsData);
        }, 100);

        response.data.tours.forEach((tour, index) => {
          console.log(`Tour ${index + 1}:`, {
            name: tour.nameTour,
            maxPeople: tour.maxPeople,
            destination: tour.destination
          });
        });
      } else {
        setError("Không thể lấy danh sách tour");
      }
    } catch (error) {
      console.error("Error fetching assigned tours:", error);
      setError(error.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerBookings = async (tourId) => {
    try {
      setLoadingCustomers(true);
      // Chỉ lấy dateSlots được phân công từ tourDateSlots state
      const assignedDateSlots = tourDateSlots[tourId] || [];

      console.log(`Tour ${tourId} có ${assignedDateSlots.length} dateSlots được phân công:`, assignedDateSlots.map(s => ({ id: s._id, date: s.dateTour })));

      // Lấy bookings cho các dateSlots được phân công
      const allBookings = [];
      for (const slot of assignedDateSlots) {
        try {
          const bookingResponse = await axiosGuide.get(`admin/bookings?slotId=${slot._id}`);
          if (bookingResponse.data.success) {
            console.log(`Slot ${slot._id} có ${bookingResponse.data.bookings.length} bookings`);
            allBookings.push(...bookingResponse.data.bookings);
          }
        } catch (error) {
          console.error(`Error fetching bookings for slot ${slot._id}:`, error);
        }
      }

      console.log(`Tổng cộng: ${allBookings.length} bookings cho tour ${tourId}`);
      setCustomerBookings(allBookings);
    } catch (error) {
      console.error("Error fetching customer bookings:", error);
      setCustomerBookings([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const showCustomerList = async (tour) => {
    setSelectedTour(tour);
    setShowCustomerModal(true);
    await fetchCustomerBookings(tour._id);
  };

  const closeCustomerModal = () => {
    setShowCustomerModal(false);
    setSelectedTour(null);
    setCustomerBookings([]);
  };

  const showSchedule = async (tour) => {
    setSelectedTour(tour);
    setShowScheduleModal(true);

    // Luôn fetch chi tiết tour để lấy schedules giống như Client
    try {
      console.log('Fetching tour schedule for tour ID:', tour._id);
      const response = await axiosGuide.get(`tour/${tour._id}`);
      console.log('Tour schedule response:', response.data);

      if (response.data.success) {
        const tourData = response.data.tour;
        const schedules = Array.isArray(tourData.schedules) ? tourData.schedules : [];

        setSelectedTour({
          ...tour,
          ...tourData,
          schedules,
          descriptionTour: tourData.descriptionTour || tour.descriptionTour
        });
      } else {
        console.error('API response not successful:', response.data);
        setSelectedTour({
          ...tour,
          schedules: [],
          descriptionTour: tour.descriptionTour
        });
      }
    } catch (error) {
      console.error('Error fetching tour schedule:', error);
      setSelectedTour({
        ...tour,
        schedules: [],
        descriptionTour: tour.descriptionTour
      });
    }
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedTour(null);
  };

  const isCurrentTimeInRange = (startDateStr, soNgay, soDem) => {
    // 1. Tính toán ngày bắt đầu và kết thúc
    const result = tinhNgayKetThucTour(startDateStr, soNgay, soDem);

    // 2. Lấy thời gian hiện tại
    const currentTime = new Date();

    // 3. So sánh thời gian hiện tại với thời gian bắt đầu và kết thúc
    const startTime = new Date(result.startDate.split(" ")[0].split("/").reverse().join("-") + " " + result.startDate.split(" ")[1]);
    const endTime = new Date(result.endDate.split(" ")[0].split("/").reverse().join("-") + " " + result.endDate.split(" ")[1]);

    // Kiểm tra xem thời gian hiện tại có nằm trong khoảng thời gian này không
    if (currentTime >= startTime && currentTime <= endTime) {
      return 0;  // Thời gian hiện tại nằm trong khoảng
    }
    if (currentTime < startTime) {
      return -1;  // Thời gian hiện tại nằm trong khoảng
    }
    if (currentTime > endTime) {
      return 1;  // Thời gian hiện tại nằm trong khoảng
    }
  }

  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');  // Ngày
    const mm = String(date.getMonth() + 1).padStart(2, '0');  // Tháng (tính từ 0)
    const yyyy = date.getFullYear();  // Năm (4 chữ số)

    const hh = String(date.getHours()).padStart(2, '0');  // Giờ
    const min = String(date.getMinutes()).padStart(2, '0');  // Phút
    const ss = String(date.getSeconds()).padStart(2, '0');  // Giây

    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
  }

  const tinhNgayKetThucTour = (startDateStr, soNgay, soDem) => {
    if (!startDateStr || soNgay <= 0 || soDem < 0) {
      throw new Error("Dữ liệu không hợp lệ");
    }

    // Xác định giờ bắt đầu: Nếu số đêm > số ngày thì bắt đầu vào buổi tối (18:00)
    // const startHour = soDem > soNgay ? 18 : 8;
    // const start = parseDate(startDateStr, startHour);
    const start = new Date(startDateStr);
    start.setHours(soDem > soNgay ? 18 : 8, 0, 0);
    // Ngày kết thúc = ngày bắt đầu + (số ngày - 1),0,
    const end = new Date(start);
    end.setDate(end.getDate() + soNgay - 1);

    // Nếu có ở lại qua đêm cuối (số đêm >= số ngày) => kết thúc sáng hôm sau lúc 08:00
    const oLaiQuaDemCuoi = soDem >= soNgay;
    if (oLaiQuaDemCuoi) {
      end.setDate(end.getDate() + 1); // sang hôm sau
      end.setHours(8, 0, 0); // 08:00:00 sáng
    } else {
      end.setHours(18, 0, 0); // 18:00:00 chiều
    }

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }

  const handleStatusChange = async (tour, dateSlot, newStatus) => {
    const regex = /^\s*(\d+)\s*ngày(?:\s+(\d+)\s*đêm)?\s*$/i;
    const match = tour.duration.match(regex);
    const days = parseInt(match[1], 10);
    const nights = match[2] ? parseInt(match[2], 10) : 0;
    const isCurrentInRangeTimeTour = isCurrentTimeInRange(dateSlot.dateTour, days, nights);
    if (isCurrentInRangeTimeTour != 0 && newStatus === 'ongoing') {
      alert('Không thể cập nhật trạng thái: Tour này chưa đến thời gian diễn ra');
      return;
    };
    if (isCurrentInRangeTimeTour == 0) {
      if (newStatus === 'completed') {
        alert('Không thể cập nhật trạng thái: Tour này chưa hết thời gian diễn ra');
        return;
      }

      if (newStatus === 'preparing') {
        alert('Không thể cập nhật trạng thái: Tour này đang trong thời gian diễn ra');
        return;
      }
    };

    if (isCurrentInRangeTimeTour == -1) {
      if (newStatus === 'completed') {
        alert('Không thể cập nhật trạng thái: Tour này chưa diễn ra');
        return;
      }
    };

    if (isCurrentInRangeTimeTour == 1) {
      if (newStatus === 'preparing') {
        alert('Không thể cập nhật trạng thái: Tour này đã diễn ra');
        return;
      }
    };
    const tourId = tour._id;
    const dateSlotId = dateSlot._id;
    // Kiểm tra xem dateSlotId có phải là ID thật không (không phải default-xxx)
    if (!dateSlotId || dateSlotId.startsWith('default-')) {
      alert('Không thể cập nhật trạng thái: Tour này chưa có lịch trình cụ thể được phân công');
      console.error('Invalid dateSlotId:', dateSlotId);
      return;
    }

    // Special handling for postponed status
    if (newStatus === 'postponed') {
      const reason = prompt('Vui lòng nhập lý do hoãn tour:');
      if (!reason || !reason.trim()) {
        return;
      }

      setUpdatingTours(prev => ({ ...prev, [tourId]: true }));

      try {
        const response = await axiosGuide.put(
          `/tour/status/${dateSlotId}`,
          {
            status: newStatus,
            note: reason,
            updatedBy: user?.employee_id || user?.full_name
          }
        );

        if (response.data.success) {
          // Update tourDateSlots with new status
          setTourDateSlots(prev => ({
            ...prev,
            [tourId]: (prev[tourId] || []).map(slot =>
              slot._id === dateSlotId
                ? { ...slot, tourStatus: newStatus, statusNote: reason, statusUpdatedAt: new Date().toISOString() }
                : slot
            )
          }));
          alert('Cập nhật trạng thái tour thành công!');
        } else {
          alert('Lỗi: ' + response.data.message);
        }
      } catch (error) {
        console.error('Error updating tour status:', error);
        alert('Lỗi khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message));
      } finally {
        setUpdatingTours(prev => ({ ...prev, [tourId]: false }));
      }
    } else {
      // Handle other status changes without note required
      setUpdatingTours(prev => ({ ...prev, [tourId]: true }));

      try {
        const response = await axiosGuide.put(
          `/tour/status/${dateSlotId}`,
          {
            status: newStatus,
            note: `Trạng thái đã được cập nhật thành ${getTourStatusText(newStatus)}`,
            updatedBy: user?.employee_id || user?.full_name
          }
        );

        if (response.data.success) {
          // Update tourDateSlots with new status
          setTourDateSlots(prev => ({
            ...prev,
            [tourId]: (prev[tourId] || []).map(slot =>
              slot._id === dateSlotId
                ? { ...slot, tourStatus: newStatus, statusNote: `Trạng thái đã được cập nhật thành ${getTourStatusText(newStatus)}`, statusUpdatedAt: new Date().toISOString() }
                : slot
            )
          }));
          alert('Cập nhật trạng thái tour thành công!');
        } else {
          alert('Lỗi: ' + response.data.message);
        }
      } catch (error) {
        console.error('Error updating tour status:', error);
        alert('Lỗi khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message));
      } finally {
        setUpdatingTours(prev => ({ ...prev, [tourId]: false }));
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };



  const getTourStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-purple-100 text-purple-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'postponed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTourStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Sắp diễn ra';
      case 'preparing': return 'Chuẩn bị diễn ra';
      case 'ongoing': return 'Đang diễn ra';
      case 'completed': return 'Hoàn thành';
      case 'postponed': return 'Hoãn tour';
      default: return 'Chưa xác định';
    }
  };

  const getSelectBgColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-purple-50 border-purple-200';
      case 'preparing': return 'bg-blue-50 border-blue-200';
      case 'ongoing': return 'bg-yellow-50 border-yellow-200';
      case 'completed': return 'bg-green-50 border-green-200';
      case 'postponed': return 'bg-red-50 border-red-200';
      default: return 'bg-white border-gray-300';
    }
  };

  const getTourStatusFromDateSlots = (tourId) => {
    const dateSlots = tourDateSlots[tourId];
    if (!dateSlots || dateSlots.length === 0) {
      return 'preparing'; // Default status if no date slots
    }

    const latestDateSlot = dateSlots.reduce((latest, current) => {
      return new Date(current.dateTour) > new Date(latest.dateTour) ? current : latest;
    }, dateSlots[0]);

    return latestDateSlot.tourStatus || 'preparing';
  };

  const openCreateSlotModal = (tour) => {
    setCreatingForTour(tour);
    setNewSlotDate('');
    setNewSlotSeats(tour?.maxPeople || 25);
    setShowCreateSlotModal(true);
  };

  const closeCreateSlotModal = () => {
    setShowCreateSlotModal(false);
    setCreatingForTour(null);
  };

  const createAndAssignDateSlot = async () => {
    if (!creatingForTour || !newSlotDate) {
      alert('Vui lòng chọn ngày cho mốc thời gian');
      return;
    }
    try {
      // 1) Tạo DateSlot
      const createResp = await axiosGuide.post('date', {
        tourId: creatingForTour._id,
        slots: [{ date: newSlotDate, seats: newSlotSeats }]
      });
      const created = createResp?.data?.createdSlots?.[0];
      if (!created?._id) throw new Error('Tạo slot không thành công');

      // 2) Gán HDV (employeeId lấy từ user trong context)
      const employeeId = user?.employeeId || user?._id || user?.employee_id;
      await axiosGuide.post(`dateslot/${created._id}/assign-employee`, { employeeId });

      // 3) Cập nhật state cục bộ để dropdown hoạt động ngay
      setTourDateSlots(prev => ({
        ...prev,
        [creatingForTour._id]: [
          ...(prev[creatingForTour._id] || []).filter(s => !(s._id && s._id.startsWith('default-'))),
          {
            _id: created._id,
            dateTour: created.dateTour || newSlotDate,
            tourStatus: 'preparing',
            status: 'active',
            availableSeats: created.availableSeats || newSlotSeats,
            bookedSeats: 0,
            totalRevenue: 0,
            depositAmount: 0,
            refundAmount: 0,
            statusNote: '',
            statusUpdatedAt: new Date().toISOString()
          }
        ]
      }));

      closeCreateSlotModal();
      alert('Tạo và phân công mốc thời gian thành công!');
    } catch (e) {
      console.error('Create/assign slot error:', e);
      alert('Lỗi khi tạo/phan công mốc thời gian: ' + (e.response?.data?.message || e.message));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Lỗi: {error}</p>
          <button
            onClick={fetchAssignedTours}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tour được giao</h1>
            <p className="text-gray-600">
              Xin chào <span className="font-medium text-blue-600">{user?.full_name}</span>,
              bạn có {tours.length} tour được phân công
            </p>
          </div>
          <button
            onClick={fetchAssignedTours}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
            disabled={loading}
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {tours.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có tour nào được phân công</h3>
          <p className="text-gray-500">Admin sẽ phân công tour cho bạn sớm nhất có thể.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tours.map((tour) => (
            <div key={tour._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{tour.nameTour}</h2>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{tour.departure_location} → {tour.destination?.locationName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{tour.duration}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTourStatusColor(getTourStatusFromDateSlots(tour._id))}`}>
                      {getTourStatusText(getTourStatusFromDateSlots(tour._id))}
                    </span>
                    <div className="mt-2 text-lg font-bold text-green-600">
                      {formatPrice(tour.finalPrice || tour.price)}
                    </div>
                  </div>
                </div>
                {/* Ngày diễn ra tour: */}
                {tourDateSlots[tour._id] && tourDateSlots[tour._id].length > 0 && (
                  <div className="text-sm text-gray-700 mb-2 font-medium">
                    Ngày diễn ra:{" "}
                    {new Date(
                      tourDateSlots[tour._id]
                        .sort((a, b) => new Date(a.dateTour) - new Date(b.dateTour))[0]
                        .dateTour
                    ).toLocaleDateString("vi-VN")}
                  </div>
                )}


                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <button
                      onClick={() => showCustomerList(tour)}
                      className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      Danh sách khách hàng
                    </button>
                    <button
                      onClick={() => showSchedule(tour)}
                      className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Lịch trình tour
                    </button>
                  </div>

                  {/* Nút cập nhật trạng thái tour */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">Trạng thái hướng dẫn viên:</span>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTourStatusColor(getTourStatusFromDateSlots(tour._id))}`}>
                          {getTourStatusText(getTourStatusFromDateSlots(tour._id))}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const dateSlots = (tourDateSlots[tour._id] || [])
                            .filter(s => s._id && !s._id.startsWith('default-'))
                            .sort((a, b) => new Date(b.dateTour) - new Date(a.dateTour));
                          const firstRealSlot = dateSlots[0];
                          if (!firstRealSlot) {
                            return (
                              <div className="text-sm text-gray-500 italic">
                                Chưa thể cập nhật: Tour chưa có lịch trình cụ thể được phân công
                              </div>
                            );
                          }
                          return (
                            <>
                              <select
                                value={getTourStatusFromDateSlots(tour._id)}
                                onChange={(e) => {
                                  handleStatusChange(tour, firstRealSlot, e.target.value);
                                }}
                                disabled={updatingTours[tour._id]}
                                className={`text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getSelectBgColor(getTourStatusFromDateSlots(tour._id))}`}
                              >
                                <option value="preparing">Chuẩn bị diễn ra</option>
                                <option value="ongoing">Đang diễn ra</option>
                                <option value="completed">Hoàn thành</option>
                                {/* <option value="postponed">Hoãn tour</option> */}
                              </select>
                              {updatingTours[tour._id] && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal danh sách khách hàng */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Danh sách khách hàng</h2>
                <p className="text-blue-100">{selectedTour?.nameTour}</p>
              </div>
              <button
                onClick={closeCustomerModal}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingCustomers ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : customerBookings.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có khách hàng đặt tour</h3>
                  <p className="text-gray-500">Tour này chưa có ai đặt chỗ.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Thống kê đơn giản */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-600">Tổng khách hàng</h3>
                      <p className="text-2xl font-bold text-blue-700">
                        {customerBookings.reduce((total, booking) => {
                          const adultCount = booking.adultPassengers?.length || 0;
                          const childCount = booking.childPassengers?.length || 0;
                          const toddlerCount = booking.toddlerPassengers?.length || 0;
                          const infantCount = booking.infantPassengers?.length || 0;
                          return total + adultCount + childCount + toddlerCount + infantCount;
                        }, 0)} người
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-green-600">Số đơn đặt tour</h3>
                      <p className="text-2xl font-bold text-green-700">{customerBookings.length} đơn</p>
                    </div>
                  </div>

                  {/* Danh sách khách hàng đơn giản */}
                  <div className="space-y-3">
                    {(() => {
                      return customerBookings.filter(e => e.note).map((passenger, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                          <div className="flex items-center">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">Ghi chú {passenger.fullNameUser}</h4>
                              <p className="text-sm text-gray-500">
                                {passenger.note}
                              </p>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}

                    {/* Thông báo nếu không có khách */}
                    {customerBookings.every(booking =>
                      (!booking.adultPassengers || booking.adultPassengers.length === 0) &&
                      (!booking.childPassengers || booking.childPassengers.length === 0) &&
                      (!booking.toddlerPassengers || booking.toddlerPassengers.length === 0) &&
                      (!booking.infantPassengers || booking.infantPassengers.length === 0)
                    ) && (
                        <div className="text-center py-8 text-gray-500">
                          <p></p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Lịch trình Tour */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 text-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Lịch trình tour</h2>
                <p className="text-green-100">{selectedTour?.nameTour}</p>
              </div>
              <button
                onClick={closeScheduleModal}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Removed tab navigation to simplify UI */}

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Header với icon */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h1 className="text-2xl font-bold text-gray-900">Lịch trình tour</h1>
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                </div>
                <p className="text-gray-600">Chi tiết hoạt động từng ngày trong chuyến du lịch</p>
              </div>

              {/* Thông tin tổng quan */}
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tổng quan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-1">Điểm khởi hành</h4>
                    <p className="text-lg font-semibold text-green-700">{selectedTour?.departure_location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-1">Điểm đến</h4>
                    <p className="text-lg font-semibold text-green-700">
                      {selectedTour?.destination ?
                        (typeof selectedTour.destination === 'object' ?
                          `${selectedTour.destination.locationName}, ${selectedTour.destination.country}` :
                          selectedTour.destination
                        ) :
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-1">Thời gian</h4>
                    <p className="text-lg font-semibold text-green-700">{selectedTour?.duration}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-1">Số lượng tối đa</h4>
                    <p className="text-lg font-semibold text-green-700">{selectedTour?.maxPeople} người</p>
                  </div>
                </div>

                {/* Thời gian khởi hành và kết thúc */}
                {(selectedTour?.departure_time || selectedTour?.return_time) && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTour?.departure_time && (
                        <div>
                          <h4 className="text-sm font-medium text-green-600 mb-1">Giờ khởi hành</h4>
                          <p className="text-lg font-semibold text-green-700">{selectedTour.departure_time}</p>
                        </div>
                      )}
                      {selectedTour?.return_time && (
                        <div>
                          <h4 className="text-sm font-medium text-green-600 mb-1">Giờ kết thúc</h4>
                          <p className="text-lg font-semibold text-green-700">{selectedTour.return_time}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Phương tiện di chuyển */}
              {selectedTour?.itemTransport && selectedTour.itemTransport.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    Phương tiện di chuyển
                  </h3>
                  <div className="grid gap-3">
                    {selectedTour.itemTransport.map((transport, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-medium mr-3">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {transport.TransportId?.transportName || 'Phương tiện di chuyển'}
                            </h4>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="mr-4">
                                <strong>Số hiệu:</strong> {transport.TransportId?.transportNumber || 'N/A'}
                              </span>
                              <span>
                                <strong>Loại:</strong> {transport.TransportId?.transportType || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lịch trình từng ngày */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Chi tiết lịch trình
                </h3>
                <TourScheduleAccordion
                  schedules={selectedTour?.schedules}
                />
              </div>

              {/* Giá tour */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Thông tin giá</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Giá người lớn:</span>
                    <div className="font-semibold text-blue-800">{formatPrice(selectedTour?.finalPrice || selectedTour?.price)}</div>
                  </div>
                  {selectedTour?.priceChildren > 0 && (
                    <div>
                      <span className="text-blue-600">Giá trẻ em:</span>
                      <div className="font-semibold text-blue-800">{formatPrice(selectedTour.priceChildren)}</div>
                    </div>
                  )}
                  {selectedTour?.priceLittleBaby > 0 && (
                    <div>
                      <span className="text-blue-600">Giá trẻ nhỏ:</span>
                      <div className="font-semibold text-blue-800">{formatPrice(selectedTour.priceLittleBaby)}</div>
                    </div>
                  )}
                  {selectedTour?.pricebaby > 0 && (
                    <div>
                      <span className="text-blue-600">Giá em bé:</span>
                      <div className="font-semibold text-blue-800">{formatPrice(selectedTour.pricebaby)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo DateSlot */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">Tạo mốc thời gian cho tour</h2>
            <p className="text-gray-700 mb-4">
              Bạn đang tạo mốc thời gian cho tour: <span className="font-semibold">{creatingForTour?.nameTour}</span>
            </p>
            <div className="mb-4">
              <label htmlFor="newSlotDate" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày phân công:
              </label>
              <input
                type="date"
                id="newSlotDate"
                value={newSlotDate}
                onChange={(e) => setNewSlotDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newSlotSeats" className="block text-sm font-medium text-gray-700 mb-1">
                Số chỗ có sẵn:
              </label>
              <input
                type="number"
                id="newSlotSeats"
                value={newSlotSeats}
                onChange={(e) => setNewSlotSeats(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeCreateSlotModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={createAndAssignDateSlot}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Tạo và phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {/* removed create-slot modal */}


    </div>
  );
};

export default TourDuocGiao;
