/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table'
import Table from 'antd/es/table';
import React from 'react'
import instance from '../../configs/axios';
import { Link } from 'react-router-dom';
import { Button, notification, Popconfirm } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  AiTwotoneDelete,
  AiFillEdit,
} from "react-icons/ai";
import { createStyles } from 'antd-style';



const ListRoom = () => {
  const [api, contextHolder] = notification.useNotification();
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
  const { data } = useQuery({
    queryKey: ['room'],
    queryFn: async () => instance.get('/room')
  })
  console.log("data",data?.data.rooms);
  
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (id: string) => {
      try {
        return await instance.delete(`/room/${id}`);
      } catch (error) {
        throw new Error("error");
      }
    },
    onSuccess: () => {
      openNotification(false)(
        "success",
        "Bạn Xóa Thành Công",
        "Bạn Đã Xóa Thành Công",
      )
      queryClient.invalidateQueries({
        queryKey: ["room"],
      });
    },
    onError: () =>
      openNotification(false)(
        "error",
        "Bạn Xóa Thất Bại",
        "Bạn Đã Xóa Thất Bại",
      ),
  });
  const useStyle = createStyles(({ css, token }) => {
    const { antCls } = token;
    return {
      customTable: css`
        ${antCls}-table {
          ${antCls}-table-container {
            ${antCls}-table-body,
            ${antCls}-table-content {
              scrollbar-width: thin;
              scrollbar-color: #eaeaea transparent;
              scrollbar-gutter: stable;
            }
          }
        }
      `,
    };
  });
  const columns: ColumnsType<any> = [
    {
      title: 'Tên Phòng',
      dataIndex: 'nameRoom',
      key: 'nameRoom',
      width: 160,
      fixed: 'left'
    },
    {
      title: 'Giá Phòng',
      dataIndex: 'priceRoom',
      key: 'priceRoom',
      render: (priceRoom: number) => priceRoom.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    },
    {
      title: 'Sức Chứa',
      dataIndex: 'capacityRoom',
      key: 'capacityRoom',
    },
    {
      title: 'Ảnh Phòng',
      dataIndex: 'imageRoom',
      key: 'imageRoom',
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
      title: 'Loại Phòng',
      dataIndex: 'typeRoom',
      key: 'typeRoom',
    },
    {
      title: 'Địa Chỉ',
      dataIndex: 'locationId',
      key: 'locationId',
      render: (_ : any, room:any) => {
        return room?.locationId?.locationName + ' - ' + room?.locationId?.country 
      }
    },
    {
      title: 'Dich Vụ Phòng',
      dataIndex: 'amenitiesRoom',
      key: 'amenitiesRoom',
      render: (amenitiesRoom) => {
        if (!Array.isArray(amenitiesRoom) || amenitiesRoom.length === 0) {
          return 'Không có tiện nghi';
        }
        return (
          <div>
            {amenitiesRoom.map((item, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                ✅ {item}
              </div>
            ))}
          </div>
        );
      }
    },
    {
      title: 'Mô Tả Phòng',
      dataIndex: 'descriptionRoom',
      key: 'descriptionRoom',
      ellipsis: true,
      render: (_: any, room: any) => {
        const limitWords = (text: string, wordLimit: number) => {
          const words = text.split(' ');
          return words.length > wordLimit
            ? words.slice(0, wordLimit).join(' ') + '...'
            : text;
        };

        return (
          <div
            dangerouslySetInnerHTML={{
              __html: limitWords(room?.descriptionRoom || "", 20),
            }}
          />
        );
      }
    },
    {
      title: "Hành động",
      key: "operation",
      fixed: "right",
      width: 150,
      render: (_: any, room: any) => {
        return (
          <div>
            <Link to={`/admin/edit-room/${room._id}`}>
              <Button type="primary" className="mr-2">
                <AiFillEdit className="text-xl" />
              </Button>
            </Link>
            <Popconfirm
              onConfirm={() => mutate(room._id)}
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
  const dataSource = data?.data.rooms.map((room: any) => ({
    key: room._id,
    ...room,
  }));
  const { styles } = useStyle();
  return (

    <div className="p-6">
      {contextHolder}
      
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Danh sách Khách Sạn</h1>
          <p className="text-gray-600">Quản lý tất cả các phòng khách sạn trong hệ thống</p>
        </div>
        <Link to="/admin/add-room">
          <Button type="primary" size="large" className="bg-blue-600 hover:bg-blue-700">
            + Thêm Khách Sạn
          </Button>
        </Link>
      </div>

      <Table
        className={styles.customTable}
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 50 }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
}

export default ListRoom
