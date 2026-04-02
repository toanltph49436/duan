/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, notification, Popconfirm, Table, type TableColumnsType } from "antd"
import instance from "../../configs/axios";
import { Link } from "react-router-dom";
import { AiFillEdit, AiTwotoneDelete } from "react-icons/ai";
import { QuestionCircleOutlined } from "@ant-design/icons";

const ListTransport = () => {
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['transport'],
    queryFn: async () => instance.get('/transport')
  })
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
  const {mutate} = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (id:any) => {
      try {
        return await instance.delete(`/transport/${id}`)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new Error("Failed to delete transport")
      }
    },
    onSuccess: () => {
      openNotification(false)(
        "success",
        "Bạn Xóa Thành Công",
        "Bạn Đã Xóa Thành Công",
      )
      queryClient.invalidateQueries({
        queryKey: ["transport"],
      });
    },
    onError: () =>
      openNotification(false)(
        "error",
        "Bạn Xóa Thất Bại",
        "Bạn Đã Xóa Thất Bại",
      ),
  });
  const columns: TableColumnsType = [
    {
      title: 'Tên Phương Tiện',
      dataIndex: 'transportName',
      key: 'transportName',
      fixed: 'left',
      width: 150,
    },
    {
      title: 'Loại Phương Tiện',
      dataIndex: 'transportType',
      key: 'transportType',
      width: 150,
    },
    {
      title: 'Ảnh Phương Tiện',
      dataIndex: 'imageTransport',
      key: 'imageTransport',
      width: 150,
      render: (image: string[]) => {
        const firstImage =
          image && image.length > 0 ? image[0] : "";
        return firstImage ? (
          <img
            src={firstImage}
            style={{ width: "100px", height: "auto" }}
            alt="Ảnh phụ"
          />
        ) : (
          "Không có ảnh nào"
        );
      },
    },
    {
      title: 'Mã Phương Tiện (Biển Số)',
      dataIndex: 'transportNumber',
      key: 'transportNumber',
      width: 150,
    },
    {
      title: 'Nơi Đón Khách',
      dataIndex: 'departureLocation',
      key: 'departureLocation',
      width: 150,
    },
    {
      title: 'Nơi Trả Khách',
      dataIndex: 'arrivalLocation',
      key: 'arrivalLocation',
      width: 150,
    },
    
    {
      title: "Hành động",
      key: "operation",
      fixed: 'right',
      width: 150,
      render: (_: any, transport: any) => {
        return (
          <div>
            <Link to={`/admin/edit-transport/${transport._id}`}>
              <Button type="primary" className="mr-2">
                <AiFillEdit className="text-xl" />
              </Button>
            </Link>
            <Popconfirm
              onConfirm={() => mutate(transport._id)}
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
  const dataSource = data?.data?.transport.map((transports: any) => ({
    key: transports._id,
    ...transports,
  }));
  return (
    <>
      {contextHolder}
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 50 }}
        scroll={{ x: 1000 }}
      />
    </>
  )
}

export default ListTransport
