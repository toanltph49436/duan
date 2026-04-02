/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, notification, Popconfirm, Table, type TableColumnsType } from 'antd'
import instance from '../../configs/axios'
import { Link } from 'react-router-dom'
import { AiFillEdit, AiTwotoneDelete } from 'react-icons/ai'
import { QuestionCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
const ListTSchedule = () => {
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['transportSchedule'],
    queryFn: async () => instance.get('/transportSchedule')
  })
  console.log(data?.data);

  const openNotification =
    (pauseOnHover: boolean) =>
      (type: "success" | "error", message: string, description: string) => {
        api.open({
          message,
          description,
          type,
          showProgress: true,
          pauseOnHover,
        });
      };
  const { mutate } = useMutation({
    mutationFn: async (id: any) => {
      try {
        return await instance.delete(`/transportSchedule/${id}`)
      } catch (error) {
        throw new Error("Failed")
      }
    },
    onSuccess: () => {
      openNotification(false)(
        "success",
        "Bạn Xóa Thành Công",
        "Bạn Đã Xóa Thành Công",
      )
      queryClient.invalidateQueries({
        queryKey: ["transportSchedule"],
      });
    },
    onError: () =>
      openNotification(false)(
        "error",
        "Bạn Xóa Thất Bại",
        "Bạn Đã Xóa Thất Bại",
      ),
  })
  const columns: TableColumnsType = [
    {
      title: 'Tên Phương Tiện',
      dataIndex: 'transport',
      key: 'transport',
      fixed: 'left',
      width: 150,
      render: (transport: any) => (
        <div>
          {transport?.transportName || 'Không có tên phương tiện'}
        </div>
      )
    },
    {
      title: 'Giá',
      dataIndex: 'priceTransport',
      key: 'priceTransport',
      fixed: 'left',
      width: 150,
      render: (priceTransport: number) => priceTransport.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    },
    {
      title: 'Thời Gian đi',
      dataIndex: 'departureTime',
      key: 'departureTime',
      width: 150,
      render: (value) => value ? dayjs(value).tz("Asia/Ho_Chi_Minh").format("HH:mm DD/MM/YYYY") : "N/A"
    },
    {
      title: 'Thời Gian đến',
      dataIndex: 'arrivalTime',
      key: 'arrivalTime',
      width: 150,
      render: (value) => value ? dayjs(value).tz("Asia/Ho_Chi_Minh").format("HH:mm DD/MM/YYYY") : "N/A"
    },
    
    {
      title: 'Sức chứa',
      dataIndex: 'availableSeats',
      key: 'availableSeats',
      fixed: 'left',
      width: 150,
    },
    {
      title: "Hành động",
      key: "operation",
      fixed: 'right',
      width: 150,
      render: (_: any, transportSchedule: any) => {
        return (
          <div>
            <Link to={`/admin/edit-Transport_Schedule/${transportSchedule._id}`}>
              <Button type="primary" className="mr-2">
                <AiFillEdit className="text-xl" />
              </Button>
            </Link>
            <Popconfirm
              onConfirm={() => mutate(transportSchedule._id)}
              title="Xóa Sản Phẩm"
              description="Bạn có chắc chắn muốn xóa sản phẩm này không?"
              okText="Có"
              cancelText="Không"
              icon={
                <QuestionCircleOutlined
                  style={{ color: "red" }}
                />
              }
            >
              <Button danger>
                <AiTwotoneDelete className="text-lg" />
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },

  ]
  const dataSource = data?.data?.transportScheduleModel.map((transportSchedules: any) => ({
    key: transportSchedules._id,
    ...transportSchedules,
  }));
  return (
    <div>
      {contextHolder}
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 50 }}
        scroll={{ x: 1000 }}
      />
    </div>
  )
}

export default ListTSchedule
