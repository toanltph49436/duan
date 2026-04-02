/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Button,
  Input,
  notification,
  Popconfirm,
  Table,
  Card,
  Select,
  Tag,
  Tooltip,
  type TableColumnsType,
} from "antd";
import { AiFillEdit, AiTwotoneDelete } from "react-icons/ai";
import { Link } from "react-router-dom";
import instance from "../../configs/axios";
import { createStyles } from "antd-style";
import { useState } from "react";

const { Search } = Input;
const { Option } = Select;

const ListTour = () => {
  // ================= GET DATA =================
  const { data } = useQuery({
    queryKey: ["tour"],
    queryFn: async () => instance.get("/tour"),
  });

  const { data: location } = useQuery({
    queryKey: ["location"],
    queryFn: async () => instance.get("/location"),
  });

  const queryClient = useQueryClient();

  // ================= STATE =================
  const [searchName, setSearchName] = useState("");
  const [searchDeparture, setSearchDeparture] = useState("");
  const [searchDuration, setSearchDuration] = useState("");

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

  // ================= DELETE =================
  const { mutate } = useMutation({
    mutationFn: async (id: any) => {
      return await instance.delete(`/tour/${id}`);
    },
    onSuccess: () => {
      openNotification(false)(
        "success",
        "Xóa thành công",
        "Tour đã được xóa",
      );
      queryClient.invalidateQueries({ queryKey: ["tour"] });
    },
    onError: () =>
      openNotification(false)(
        "error",
        "Xóa thất bại",
        "Có lỗi xảy ra",
      ),
  });

  // ================= HELPER =================

  // lấy tên location từ id
  const getLocationName = (id: string) => {
    const loc = location?.data?.location?.find(
      (l: any) => String(l._id) === String(id)
    );
    return loc ? `${loc.locationName} - ${loc.country}` : id;
  };

  // bỏ HTML
  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  // cắt chữ
  const limitWords = (text: string, wordLimit: number) => {
    const words = text.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  // ================= COLUMNS =================
  const columns: TableColumnsType = [
    {
      title: "Tên Tour",
      dataIndex: "nameTour",
      key: "nameTour",
      width: 250,
      fixed: "left",
    },
    {
      title: "Điểm Đến",
      dataIndex: "destination",
      key: "destination",
      render: (_: any, tour: any) =>
        `${tour?.destination?.locationName} - ${tour?.destination?.country}`,
    },
    {
      title: "Nơi Xuất Phát",
      dataIndex: "departure_location",
      key: "departure_location",
      render: (value: string) => getLocationName(value),
    },
    {
      title: "Ảnh Tour",
      dataIndex: "imageTour",
      key: "imageTour",
      render: (image: string[]) => {
        const img = image?.[0];
        return img ? (
          <img
            src={img}
            style={{
              width: 90,
              height: 60,
              objectFit: "cover",
              borderRadius: 6,
            }}
          />
        ) : (
          "Không có"
        );
      },
    },
    {
      title: "Số Ngày",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) =>
        price?.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "Phương Tiện",
      dataIndex: "itemTransport",
      key: "itemTransport",
      render: (transports: any[]) => {
        if (!transports?.length) return "Không có";
        return (
          <>
            {transports.map((t: any, i: number) => (
              <Tag key={i} color="blue">
                {t.TransportId?.transportName}
              </Tag>
            ))}
          </>
        );
      },
    },
    {
      title: "Mô Tả",
      dataIndex: "descriptionTour",
      key: "descriptionTour",
      render: (html: string) => {
        const text = stripHtml(html || "");
        const short = limitWords(text, 20);

        return (
          <Tooltip title={text}>
            <span>{short}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_: any, tour: any) => (
        <div className="flex gap-2">
          <Link to={`/admin/edit-tour/${tour._id}`}>
            <Button type="primary">
              <AiFillEdit />
            </Button>
          </Link>

          <Popconfirm
            title="Xóa tour?"
            onConfirm={() => mutate(tour._id)}
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          >
            <Button danger>
              <AiTwotoneDelete />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // ================= DATA =================
  const dataSource = data?.data?.tours.map((t: any) => ({
    key: t._id,
    ...t,
  }));

  // ================= FILTER =================
  const filteredData = dataSource?.filter((tour: any) =>
    tour?.nameTour?.toLowerCase().includes(searchName.toLowerCase()) &&
    (searchDeparture
      ? String(tour?.departure_location) === String(searchDeparture)
      : true) &&
    (searchDuration
      ? tour?.duration?.toString() === searchDuration
      : true)
  );

  const useStyle = createStyles(({ css }) => ({
    customTable: css`
      .ant-table {
        border-radius: 12px;
        overflow: hidden;
      }
    `,
  }));

  const { styles } = useStyle();

  // ================= UI =================
  return (
    <>
      {contextHolder}

      <Card
        title={
          <h2 className="text-xl font-bold text-blue-600">
            Danh sách Tour
          </h2>
        }
        extra={
          <div className="flex gap-3">
            <Search
              placeholder="Tên tour..."
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 220 }}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />

            {/* SELECT LOCATION */}
            <Select
              placeholder="Nơi xuất phát"
              allowClear
              style={{ width: 200 }}
              value={searchDeparture || undefined}
              onChange={(value) => setSearchDeparture(value || "")}
            >
              {location?.data?.location?.map((loc: any) => (
                <Option key={loc._id} value={loc._id}>
                  {loc.locationName} - {loc.country}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Số ngày"
              allowClear
              style={{ width: 150 }}
              value={searchDuration || undefined}
              onChange={(value) => setSearchDuration(value || "")}
            >
              {[...new Set(dataSource?.map((t: any) => t.duration))].map(
                (dur) => (
                  <Option key={dur} value={dur}>
                    {dur}
                  </Option>
                )
              )}
            </Select>

            <Button
              onClick={() => {
                setSearchName("");
                setSearchDeparture("");
                setSearchDuration("");
              }}
            >
              Reset
            </Button>
          </div>
        }
      >
        <Table
          className={styles.customTable}
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </>
  );
};

export default ListTour;