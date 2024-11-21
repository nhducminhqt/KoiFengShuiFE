import React, { useEffect, useState } from 'react';
import api from '../../../axious/axious';
import { notification, Pagination, Table, Modal, Button, Form, Input, Space, Select, Tag } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, MailOutlined, PlusOutlined } from '@ant-design/icons';
import { getToken } from '../../../service/localStorageService';

interface ConsultationResultsPageProps {
  setIsNavbarVisible: (visible: boolean) => void;
}

interface ConsultationResult {
  id: number;
  consultantName: string;
  description: string;
  status: string;
  createdDate?: string;
  consultationCategoryId?: number;
  accountId?: number;
  consultationRequestId?: number;
  consultationRequestDetailId?: number;
}

interface ConsultationCategory {
  id: number;
  name: string;
}

interface Account {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface ConsultationRequest {
  id: number;
  fullName: string;
  description: string;
  createdDate: string;
  status: string;
}

interface ConsultationRequestDetail {
  id: number;
  description: string;
  createdDate: string;
  createdBy: string;
  updatedBy: string;
  shelterCategoryIds: number[];
  animalCategoryIds: number[];
  consultationResults: ConsultationResult[];
}

interface ApiResponse<T> {
  result: T;
}

interface PageResponse<T> {
  data: T[];
  totalElements: number;
}

const { Option } = Select;

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const ConsultationResultsPage: React.FC<ConsultationResultsPageProps> = ({ setIsNavbarVisible }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [consultationResults, setConsultationResults] = useState<ConsultationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ConsultationResult | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [search, setSearch] = useState('');
  const [accountDetails, setAccountDetails] = useState<Account | null>(null);
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<ConsultationRequestDetail | null>(null);
  const [selectedRequestInfo, setSelectedRequestInfo] = useState<ConsultationRequest | null>(null);
  const [consultationCategories, setConsultationCategories] = useState<ConsultationCategory[]>([]);
  const pageSize = 10;

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  useEffect(() => {
    fetchConsultationResults(page, pageSize, search);
    fetchConsultationRequests();
    fetchConsultationCategories();
  }, [page, search]);

  const fetchConsultationResults = async (page: number, size: number, search: string) => {
    setLoading(true);
    const token = getToken();

    try {
      const response = await api.get<ApiResponse<PageResponse<ConsultationResult>>>(
        `/api/consultation-results/consultation-result-search`, {
          params: { page, size, search },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 && response.data.result) {
        setConsultationResults(response.data.result.data);
        setTotalElements(response.data.result.totalElements);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error: any) {
      console.error('Error fetching consultation result info: ', error);
  
      // Extract backend error message if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch consultation result info.';
      notification.error({
        message: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultationRequests = async () => {
    const token = getToken();
    try {
      const response = await api.get<ApiResponse<ConsultationRequest[]>>(
        `/api/consultation-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 && response.data.result) {
        setConsultationRequests(response.data.result);
      }
    } catch (error: any) {
      console.error('Error fetching consultation request info: ', error);
  
      // Extract backend error message if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch consultation request info.';
      notification.error({
        message: 'Error',
        description: errorMessage,
      });
    }
  };

  const fetchConsultationCategories = async () => {
    const token = getToken();
    try {
      const response = await api.get<ApiResponse<ConsultationCategory[]>>(
        `/api/consultation-category`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 && response.data.result) {
        setConsultationCategories(response.data.result);
      }
    } catch (error: any) {
      console.error('Error fetching consultation category info: ', error);
  
      // Extract backend error message if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch consultation category info.';
      notification.error({
        message: 'Error',
        description: errorMessage,
      });
    }
  };

  const fetchAccountDetails = async (accountId: number) => {
    const token = getToken();
    try {
      const response = await api.get<ApiResponse<Account>>(
        `/users/${accountId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 && response.data.result) {
        setAccountDetails(response.data.result);
      }
    } catch (error: any) {
      console.error('Error fetching account detail info: ', error);
  
      // Extract backend error message if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch account detail info.';
      notification.error({
        message: 'Error',
        description: errorMessage,
      });
    }
  };

  const fetchRequestInfo = async (requestId: number) => {
    const token = getToken();
    try {
      const response = await api.get<ApiResponse<ConsultationRequest>>(
        `/api/consultation-requests/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 && response.data.result) {
        setSelectedRequestInfo(response.data.result);
      }
    } catch (error: any) {
      console.error('Error fetching request info: ', error);
  
      // Extract backend error message if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch request info.';
      notification.error({
        message: 'Error',
        description: errorMessage,
      });
    }
  };

  const fetchRequestDetailInfo = async (requestDetailId: number) => {
    const token = getToken();
    try {
      const response = await api.get<ApiResponse<ConsultationRequestDetail>>(
        `/api/consultation-request-details/${requestDetailId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 && response.data.result) {
        setSelectedRequestDetail(response.data.result);
      }
    } catch (error: any) {
      console.error('Error fetching request detail info: ', error);
  
      // Extract backend error message if available
      const errorMessage = error.response?.data?.message || 'Failed to fetch request detail info.';
      notification.error({
        message: 'Error',
        description: errorMessage,
      });
    }
  };

  const handleSendEmail = async (resultId: number) => {
    const token = getToken();
    try {
      await api.put(
        `/api/consultation-results/send-email/${resultId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notification.success({ message: 'Email sent successfully!' });
  
      fetchConsultationResults(page, pageSize, search);
    } catch (error: any) {
      console.error('Error sending email: ', error);
  
      // Extract backend error message if available
      const errorMessage = error.response?.data?.message || 'Failed to send email.';
      notification.error({
        message: 'Error',
        description: errorMessage,
      });
    }
  };
  

  const showViewModal = async (result: ConsultationResult) => {
    setSelectedResult(result);
    setIsViewMode(true);
    setIsUpdateMode(false);
    setIsModalVisible(true);
    setIsNavbarVisible(false);

    if (result.accountId) fetchAccountDetails(result.accountId);
    if (result.consultationRequestId) fetchRequestInfo(result.consultationRequestId);
    if (result.consultationRequestDetailId) fetchRequestDetailInfo(result.consultationRequestDetailId);
  };

  const showEditModal = async (result: ConsultationResult) => {
    setSelectedResult(result);
    setIsViewMode(false);
    setIsUpdateMode(true);
    setIsModalVisible(true);
    setIsNavbarVisible(false);

    if (result.accountId) await fetchAccountDetails(result.accountId);
  };

  const showAddModal = () => {
    setSelectedResult({ id: 0, consultantName: '', description: '', status: 'PENDING' });
    setIsViewMode(false);
    setIsUpdateMode(false);
    setIsModalVisible(true);
    setIsNavbarVisible(false);
  };

  const handleModalOk = async () => {
    if (selectedResult) {
      const token = getToken();
  
      // Prepare data with required fields validation
      const dataToSend = {
        consultantName: selectedResult.consultantName || null,
        description: selectedResult.description || null,
        status: selectedResult.status || null,
        consultationCategoryId: selectedResult.consultationCategoryId || null,
        consultationRequestId: selectedResult.consultationRequestId || null,
      };
  
      // Helper function to count words
      const countWords = (text: string) => text.trim().split(/\s+/).length;
  
      // Validate required fields
      if (
        !dataToSend.consultantName ||
        !dataToSend.description ||
        !dataToSend.status ||
        !dataToSend.consultationCategoryId ||
        !dataToSend.consultationRequestId
      ) {
        notification.error({
          message: 'Validation Error',
          description: 'All fields are required. Please ensure no fields are left blank.',
        });
        return; // Stop if any required field is missing
      }
  
      // Check if description has at least 10 words
      if (countWords(dataToSend.description) < 10) {
        notification.error({
          message: 'Validation Error',
          description: 'Description must contain at least 20 words.',
        });
        return; // Stop if description has less than 10 words
      }
  
      try {
        if (isUpdateMode && selectedResult.id) {
          // Send request to update consultation result
          await api.put(
            `/api/consultation-results/${selectedResult.id}`,
            dataToSend,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          notification.success({ message: 'Update successful!' });
        } else if (!isViewMode) {
          // Send request to add new consultation result
          await api.post(
            `/api/consultation-results/requestId/${selectedResult.consultationRequestId}`,
            dataToSend,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          notification.success({ message: 'Addition successful!' });
        }
  
        // Reload list after successful save
        fetchConsultationResults(page, pageSize, search);
  
        // Reset state and close modal
        setIsModalVisible(false);
        setSelectedResult(null);
        setIsNavbarVisible(true);
      } catch (error: any) {
        console.error('Error saving consultation result: ', error);
  
        // Show error if any
        const errorMessage = error.response?.data?.message || 'Failed to save consultation result.';
        notification.error({
          message: 'Error',
          description: errorMessage,
        });
      }
    }
  };
  
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setIsNavbarVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: ConsultationResult, b: ConsultationResult) => a.id - b.id,
    },
    {
      title: 'Consultant Name',
      dataIndex: 'consultantName',
      key: 'consultantName',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a: ConsultationResult, b: ConsultationResult) => {
        const statusOrder: { [key: string]: number } = { 'PENDING': 1, 'COMPLETED': 2, 'CANCELLED': 3 };
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      },
      render: (status: string) => (
        <Tag color={status === 'COMPLETED' ? 'green' : status === 'PENDING' ? 'orange' : 'red'}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ConsultationResult) => (
        <Space>
          <Button icon={<EyeOutlined />} type="default" onClick={() => showViewModal(record)}>
            View
          </Button>
          <Button icon={<EditOutlined />} type="primary" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button icon={<MailOutlined />} type="dashed" onClick={() => handleSendEmail(record.id)}>
            Send Email
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Consultation Results</h2>
      <Space style={{ marginBottom: '20px' }}>
        <Input.Search
          placeholder="Search by Consultant Name"
          enterButton={<SearchOutlined />}
          onSearch={(value) => { setSearch(value); setPage(1); }}
          style={{ width: '300px' }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Consultation Result
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={consultationResults}
        pagination={false}
        rowKey="id"
        loading={loading}
      />
      <Pagination
        current={page}
        pageSize={pageSize}
        total={totalElements}
        onChange={(newPage) => setPage(newPage)}
        style={{ marginTop: '20px', textAlign: 'center' }}
      />

      <Modal
        title={isViewMode ? "View Consultation Result" : isUpdateMode ? "Edit Consultation Result" : "Add Consultation Result"}
        open={isModalVisible}
        onOk={isViewMode ? handleModalCancel : handleModalOk}
        onCancel={handleModalCancel}
        okText={isViewMode ? "Close" : "Save"}
        width={800}
        cancelButtonProps={{ style: { display: isViewMode ? 'none' : 'inline-block' } }}
      >
        <Form layout="vertical" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
          {/* Conditional sections for Update or View Mode */}
          {isUpdateMode || isViewMode ? (
            <>
              {/* Account Details Section */}
              <Form.Item label="Account Details" style={{ marginBottom: '16px' }}>
                <p><strong>ID:</strong> {accountDetails?.id}</p>
                <p><strong>Name:</strong> {accountDetails?.fullName}</p>
                <p><strong>Email:</strong> {accountDetails?.email}</p>
                <p><strong>Phone Number:</strong> {accountDetails?.phoneNumber}</p>
              </Form.Item>

              {/* Consultation Request Info Section */}
              <Form.Item label="Consultation Request Info" style={{ marginBottom: '16px' }}>
                <p><strong>ID:</strong> {selectedRequestInfo?.id}</p>
                <p><strong>Description:</strong> {selectedRequestInfo?.description}</p>
                <p><strong>Created Date:</strong> {selectedRequestInfo?.createdDate}</p>
              </Form.Item>
            </>
          ) : (
            <>
              {/* Consultation Request Selection */}
              <Form.Item
                label={<span>Consultation Request <span style={{ color: 'red' }}>*</span></span>}
                colon={false}
                required
                validateStatus={!selectedResult?.consultationRequestId ? 'error' : 'success'}
                help={!selectedResult?.consultationRequestId && 'Please select a consultation request.'}
                style={{ marginBottom: '16px' }}
              >
                <Select
                  placeholder="Select Consultation Request"
                  onChange={(requestId) => {
                    setSelectedResult({ ...selectedResult!, consultationRequestId: requestId });
                    fetchRequestDetailInfo(requestId);
                  }}
                  value={selectedResult?.consultationRequestId}
                >
                  {consultationRequests.map((request) => (
                    <Option key={request.id} value={request.id}>
                      {request.id} - {request.fullName} - {request.createdDate} - {request.status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          {/* Consultation Category Selection */}
          <Form.Item
            label={<span>Consultation Category <span style={{ color: 'red' }}>*</span></span>}
            colon={false}
            required
            validateStatus={!selectedResult?.consultationCategoryId ? 'error' : 'success'}
            help={!selectedResult?.consultationCategoryId && 'Please select a consultation category.'}
            style={{ marginBottom: '16px' }}
          >
            <Select
              placeholder="Select Consultation Category"
              onChange={(categoryId) => setSelectedResult({ ...selectedResult!, consultationCategoryId: categoryId })}
              value={selectedResult?.consultationCategoryId}
              disabled={isViewMode}
            >
              {consultationCategories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Consultant Name Field */}
          <Form.Item
            label={<span>Consultant Name <span style={{ color: 'red' }}>*</span></span>}
            colon={false}
            required
            validateStatus={!selectedResult?.consultantName ? 'error' : 'success'}
            help={!selectedResult?.consultantName && 'Consultant name is required.'}
            style={{ marginBottom: '16px' }}
          >
            <Input
              value={selectedResult?.consultantName}
              onChange={(e) => setSelectedResult({ ...selectedResult!, consultantName: e.target.value })}
              disabled={isViewMode}
            />
          </Form.Item>

          {/* Description Field with 20-word validation */}
          <Form.Item
            label={<span>Description <span style={{ color: 'red' }}>*</span></span>}
            colon={false}
            required
            validateStatus={selectedResult?.description && selectedResult.description.trim().split(/\s+/).length >= 10 ? 'success' : 'error'}
            help={
              !selectedResult?.description
                ? 'Description is required.'
                : selectedResult.description.trim().split(/\s+/).length < 20
                ? 'Description must contain at least 20 words.'
                : ''
            }
            style={{ marginBottom: '16px' }}
          >
            <Input.TextArea
              value={selectedResult?.description}
              onChange={(e) => setSelectedResult({ ...selectedResult!, description: e.target.value })}
              disabled={isViewMode}
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* Status Selection */}
          <Form.Item
            label={<span>Status <span style={{ color: 'red' }}>*</span></span>}
            colon={false}
            required
            validateStatus={!selectedResult?.status ? 'error' : 'success'}
            help={!selectedResult?.status && 'Please select a status.'}
            style={{ marginBottom: '16px' }}
          >
            <Select
              value={selectedResult?.status}
              onChange={(status) => setSelectedResult({ ...selectedResult!, status })}
              disabled={!isUpdateMode}
            >
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>



      </Modal>

    </div>
  );
};

export default ConsultationResultsPage;
