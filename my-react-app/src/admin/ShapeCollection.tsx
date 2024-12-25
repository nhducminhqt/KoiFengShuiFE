import React, { ChangeEvent, useEffect, useState } from "react";
import { Button, Form, Input, Popconfirm, Modal, Space, Table, Radio, notification, Pagination } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import api from "../axious/axious";
import Shape from "../models/Shape";
import { findByShape, getAllShapes } from "./api/ShapeAPI";
import DestinyTuongSinh from "../models/DestinyTuongSinh";
import DestinyTuongKhac from "../models/DestinyTuongKhac";

interface ShapeCollectionProps {
  setIsNavbarVisible: (visible: boolean) => void; 
}

interface Destinys {
  id: number;
  destiny: string;
}

const ShapeCollection: React.FC<ShapeCollectionProps> = ({ setIsNavbarVisible }) => {
  const [listShape, setListShape] = useState<Shape[]>([]);
  const [reloadData, setReloadData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNow, setPageNow] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [name, setColor] = useState("");
  const [searchReload, setSearchReload] = useState("");
  const [destinyOptions, setDestinyOptions] = useState<Destinys[]>([]);
  const [selectedDestiny, setSelectedDestiny] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [destinyToTuongSinhMap, setDestinyToTuongSinhMap] = useState<{ [key: string]: DestinyTuongSinh[] }>({});
  const [destinyToTuongKhacMap, setDestinyToTuongKhacMap] = useState<{ [key: string]: DestinyTuongKhac[] }>({});
  const pageSize = 10;

  const [apii, contextHolder] = notification.useNotification();

  const reloadShapeList = (page: number = 1) => {
    setReloadData(true);

    if (name === "") {
      getAllShapes(page, pageSize)
        .then((shapeData) => {
          if (shapeData) {
            setListShape(shapeData.result);
            setTotalElements(shapeData.totalElements);
            setPageNow(page);
          } else {
            setError("No data found.");
          }
          setReloadData(false);
        })
        .catch((error) => {
          setError(error.message);
          setReloadData(false);
        });
    } else {
      findByShape(name, page, pageSize)
        .then((shapeData) => {
          if (shapeData) {
            setListShape(shapeData.result);
            setTotalElements(shapeData.totalElements);
            setPageNow(page);
          } else {
            setError("No data found.");
          }
          setReloadData(false);
        })
        .catch((error) => {
          setError(error.message);
          setReloadData(false);
        });
    }
  };
  useEffect(() => {
    const fetchDestinies = async () => {
      const destinies = await getAllDestinies();
      if (destinies) {
        setDestinyOptions(destinies);
      }
    };
   
    fetchDestinies();
    reloadShapeList(pageNow);
  }, [pageNow, name]);
  const onPaginationChange = (page: number) => {
    setPageNow(page); // Cập nhật trạng thái để hiển thị trang mới
    reloadShapeList(page); // Gọi lại API với trang mới
};
  const getAllDestinies = async (): Promise<Destinys[] | null> => {
    try {
      const response = await api.get(`/destinys`);
      if (response.data.code === 1000) {
        return response.data.result.map((destiny: any) => ({
          id: destiny.id,
          destiny: destiny.destiny,
        })) as Destinys[];
      }
      console.error("Failed to fetch destinies: ", response.status);
      return null;
    } catch (error: any) {
      apii.error({ message: 'Error', description: error.response.data.message });
      return null;
    }
  };

  const handleUpdate = (id: number) => {
    const color = listShape.find(shape => shape.id === id);
    if (color) {
      setSelectedShape(color);
      setSelectedDestiny(color.destiny?.id || null);
      setIsModalVisible(true);
      setIsUpdateMode(true);
      setIsNavbarVisible(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/shapes/${id}`);
      if (response.data.code === 1000) {
        apii.success({ message: 'Success', description: 'Shape has been successfully deleted.' });
        reloadShapeList();
      } else {
        apii.error({ message: 'Error', description: response.data.message });
      }
    } catch (error: any) {
      apii.error({ message: 'Error', description: error.response.data.message });
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedShape(null);
    setSelectedDestiny(null);
    setIsNavbarVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await api.put(`/shapes/${selectedShape?.id}`, {
        shape: selectedShape?.shape,
        destiny: { id: selectedDestiny },
      });

      if (response.data.code === 1000) {
        apii.success({ message: 'Success', description: 'Shape has been successfully added.' });
        setIsModalVisible(false);
        reloadShapeList();
      } else {
        apii.error({ message: 'Error', description: response.data.message });
      }
    } catch (error: any) {
      apii.error({ message: 'Error', description: error.response.data.message });
    }
  };

  const handleSearch = () => {
    setColor(searchReload);
    setReloadData(true);
    setPageNow(1);
  };
  const fetchDestinyTuongSinh = async (destinyName: string) => {
    try {
      const response = await api.get(`/destinys/${destinyName}`);
      if (response.data.code === 1000) {
        const tuongSinhData = response.data.result.destinyTuongSinhs;
        const tuongKhacData = response.data.result.destinyTuongKhacs;

        const newDestinyTuongSinhs = tuongSinhData.map((item: any) => new DestinyTuongSinh(item.name));
        const newDestinyTuongKhac = tuongKhacData.map((item: any) => new DestinyTuongKhac(item.name));

        // Update the map with the new data for the specific destiny
        setDestinyToTuongSinhMap((prev) => ({
          ...prev,
          [destinyName]: newDestinyTuongSinhs,
        }));
        setDestinyToTuongKhacMap((prev) => ({
          ...prev,
          [destinyName]: newDestinyTuongKhac,
        }));
      }
    } catch (error) {
      console.error("Error fetching DestinyTuongSinh:", error);
    }
  };



  useEffect(() => {
    listShape.forEach((shape) => {
      const destinyName = shape.destiny?.destiny;
      if (destinyName && !destinyToTuongSinhMap[destinyName]) {
        fetchDestinyTuongSinh(destinyName);
      }
    });
  }, [listShape]);
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      render: (text: string, record: Shape, index: number) => index + 1 + (pageNow - 1) * pageSize,
    },
    {
      title: 'Shape',
      dataIndex: 'shape',
      key: 'shape',
      render: (text: string) => (
        <span
          title={text}
          style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Mutual Accord',
      dataIndex: 'destiny',
      key: 'destiny',
      render: (destiny: { id: number; destiny: string }) => (
        <span title={destiny?.destiny} style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
          {destiny?.destiny}
        </span>
      ),
    },
    {
      title: 'Mutual Generation',
      key: 'destinyTuongSinh',
      render: (text: string, record: Shape) => {
        const destinyName = record.destiny?.destiny;
        const tuongSinhList = destinyName ? destinyToTuongSinhMap[destinyName] || [] : [];
    
        // Join the names with commas
        const tuongSinhNames = tuongSinhList.map((tuongSinh) => tuongSinh.name).join(', ');
    
        return tuongSinhNames || "No data available";
      },
    },
    {
      title: 'Mutual Overcoming',
      key: 'destinyTuongSinh',
      render: (text: string, record: Shape) => {
        const destinyName = record.destiny?.destiny;
        const tuongKhacList = destinyName ? destinyToTuongKhacMap[destinyName] || [] : [];
    
        // Join the names with commas
        const tuongKhacNames = tuongKhacList.map((tuongKhac) => tuongKhac.name).join(', ');
    
        return tuongKhacNames || "No data available";
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: Shape) => (
        <Space size="middle">
          <Button
            onClick={() => {
              if (record.id !== undefined) {
                handleUpdate(record.id);
              } else {
                console.error("Shape ID is undefined, cannot update.");
              }
            }}
          >
            Update
          </Button>
          <Popconfirm
            title="Delete the color"
            okText="Yes"
            cancelText="No"
            onConfirm={() => {
              if (record.id !== undefined) {
                handleDelete(record.id);  // Change this to handleDelete
              } else {
                console.error("Shape ID is undefined, cannot delete.");
              }
            }}
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const onSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchReload(e.target.value);
  };

  return (
    <>
      {contextHolder}
      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex">
          <Input
            value={searchReload}
            onChange={onSearchInputChange}
            className="mr-2"
            placeholder="Search by name"
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Search
          </Button>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => 
          {
            setIsModalVisible(true);
            setIsNavbarVisible(false); 
          }}>
          Add Shape
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={listShape}
        pagination={false}
        rowKey="id"
      />
      <Pagination
        current={pageNow}
        total={totalElements}
        pageSize={pageSize}
        onChange={onPaginationChange}
        style={{ textAlign: 'end', marginTop: '20px' }}
      />
      <Modal
        title={isUpdateMode ? "Update Shape" : "Add Shape"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        width={1000}
        style={{ top: '15%' }}
      >
        <Form onFinish={handleSubmit}>
          <Form.Item
            label="Name"
            required
            rules={[{ required: true, message: 'Please input the shape name!' }]}
          >
            <Input
              value={selectedShape?.shape}
              onChange={(e) => setSelectedShape((prev) => prev && { ...prev, shape: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Destiny">
            <Radio.Group
              onChange={e => setSelectedDestiny(e.target.value)}
              value={selectedDestiny}
            >
              {destinyOptions.map(destiny => (
                <Radio key={destiny.id} value={destiny.id}>
                  {destiny.destiny}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ShapeCollection;
