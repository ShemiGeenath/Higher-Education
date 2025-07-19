import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Popconfirm,
  Tag,
  Avatar,
  message,
  Card,
  Row,
  Col,
  Upload,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PlusOutlined,
  QrcodeOutlined,
  ScheduleOutlined,
  MoneyCollectOutlined,
  DownloadOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import moment from "moment";
import html2canvas from "html2canvas";
import QrScanner from "qr-scanner";

const { Option } = Select;

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [qrSearchVisible, setQrSearchVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const qrRef = useRef(null);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Fetch students from backend
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data);
    } catch (error) {
      message.error("Failed to fetch students.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current = null;
      }
    };
  }, []);

  // Filter students based on search text
  const filteredStudents = students.filter((student) =>
    Object.values(student).some((val) =>
      val
        ? val.toString().toLowerCase().includes(searchText.toLowerCase())
        : false
    )
  );

  // Show Add or Edit Modal
  const openModal = (student = null) => {
    setSelectedStudent(student);
    if (student) {
      form.setFieldsValue({
        ...student,
        admissionDate: moment(student.admissionDate),
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Handle Add/Edit form submit
  const onFinish = async (values) => {
    try {
      const studentData = {
        ...values,
        admissionDate: values.admissionDate.toISOString(),
      };

      if (selectedStudent) {
        // Edit existing student
        await axios.put(
          `http://localhost:5000/api/students/${selectedStudent._id}`,
          studentData
        );
        message.success("Student updated successfully");
      } else {
        // Add new student
        await axios.post("http://localhost:5000/api/students", studentData);
        message.success("Student added successfully");
      }

      fetchStudents();
      setModalVisible(false);
    } catch (error) {
      message.error("Failed to save student");
    }
  };

  // Delete student
  const deleteStudent = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      message.success("Student deleted");
      fetchStudents();
    } catch (error) {
      message.error("Failed to delete student");
    }
  };

  // Show QR Modal
  const showQrModal = (student) => {
    setQrData({
      id: student._id,
      name: student.name,
      nic: student.nic,
    });
    setQrModalVisible(true);
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (qrRef.current) {
      html2canvas(qrRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `${qrData.name}_QR.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Handle QR Search Upload
  const handleQrSearch = async (file) => {
    setUploading(true);
    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      
      try {
        const decodedData = JSON.parse(result.data);
        const foundStudent = students.find(s => s._id === decodedData.id);
        
        if (foundStudent) {
          setSelectedStudent(foundStudent);
          message.success(`Found student: ${foundStudent.name}`);
          setQrSearchVisible(false);
        } else {
          message.warning("No matching student found");
        }
      } catch (e) {
        message.error("Invalid QR code format");
      }
    } catch (error) {
      message.error("Failed to scan QR code");
    }
    setUploading(false);
    return false; // Prevent default upload behavior
  };

  // Start camera for QR scanning
  const startCamera = async () => {
    try {
      setCameraActive(true);
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        result => {
          try {
            const decodedData = JSON.parse(result.data);
            const foundStudent = students.find(s => s._id === decodedData.id);
            
            if (foundStudent) {
              setSelectedStudent(foundStudent);
              message.success(`Found student: ${foundStudent.name}`);
              stopCamera();
              setQrSearchVisible(false);
            } else {
              message.warning("No matching student found");
            }
          } catch (e) {
            message.error("Invalid QR code format");
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      await qrScannerRef.current.start();
    } catch (error) {
      message.error("Failed to access camera");
      console.error(error);
      setCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current = null;
    }
    setCameraActive(false);
  };

  // Clean up camera when modal closes
  const handleQrSearchModalClose = () => {
    stopCamera();
    setQrSearchVisible(false);
  };

  // Table columns
  const columns = [
    {
      title: "Profile",
      dataIndex: "profilePicture",
      render: (pic) =>
        pic ? (
          <Avatar src={`/uploads/${pic}`} size="large" />
        ) : (
          <Avatar icon={<UserOutlined />} size="large" />
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "NIC",
      dataIndex: "nic",
    },
    {
      title: "Stream",
      dataIndex: "stream",
      render: (stream) => {
        let color = "purple";
        if (stream === "Physical Science") color = "blue";
        else if (stream === "Biological Science") color = "green";
        else if (stream === "Commerce") color = "orange";
        return <Tag color={color}>{stream}</Tag>;
      },
    },
    {
      title: "Contact",
      dataIndex: "contact",
    },
    {
      title: "Admission Date",
      dataIndex: "admissionDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
      sorter: (a, b) =>
        moment(a.admissionDate).unix() - moment(b.admissionDate).unix(),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<QrcodeOutlined />}
            onClick={() => showQrModal(record)}
          />
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => deleteStudent(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
          <Button
            type="dashed"
            onClick={() => navigate(`/attendance/${record._id}`)}
            style={{ marginLeft: 8 }}
            title="Go to Attendance"
          >
            <ScheduleOutlined />
          </Button>
          <Button
            type="dashed"
            onClick={() => navigate(`/payments/${record._id}`)}
            title="Go to Payments"
          >
            <MoneyCollectOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Student Management"
        extra={
          <Space>
            <Button 
              icon={<QrcodeOutlined />} 
              onClick={() => setQrSearchVisible(true)}
              title="Search by QR"
            />
            <Input
              placeholder="Search students..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/AddStudent")}>
              Add Student
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={filteredStudents}
          columns={columns}
          rowKey={(record) => record._id}
          loading={loading}
          scroll={{ x: true }}
        />
      </Card>

      {/* Add/Edit Student Modal */}
      <Modal
        title={selectedStudent ? "Edit Student" : "Add New Student"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ stream: "Physical Science" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="NIC Number"
                name="nic"
                rules={[{ required: true, message: "Please enter NIC" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="School Name"
                name="schoolName"
                rules={[{ required: true, message: "Please enter school name" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Age"
                name="age"
                rules={[{ required: true, message: "Please enter age" }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Contact"
                name="contact"
                rules={[{ required: true, message: "Please enter contact" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Admission Date"
                name="admissionDate"
                rules={[{ required: true, message: "Please select admission date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Address" name="address">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Guardian Name" name="guardianName">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Guardian Contact" name="guardianContact">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Stream"
            name="stream"
            rules={[{ required: true, message: "Please select stream" }]}
          >
            <Select>
              <Option value="Physical Science">Physical Science</Option>
              <Option value="Biological Science">Biological Science</Option>
              <Option value="Commerce">Commerce</Option>
              <Option value="Arts">Arts</Option>
              <Option value="Technology">Technology</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title="Student QR Code"
        visible={qrModalVisible}
        footer={
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={downloadQRCode}
          >
            Download QR
          </Button>
        }
        onCancel={() => setQrModalVisible(false)}
      >
        <div style={{ textAlign: "center", padding: 20 }}>
          {qrData && (
            <div ref={qrRef}>
              <QRCode value={JSON.stringify(qrData)} size={200} level="H" />
              <h3 style={{ marginTop: 16 }}>{qrData.name}</h3>
              <p>NIC: {qrData.nic}</p>
              <Button
                type="primary"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(qrData))}
                style={{ marginTop: 16 }}
              >
                Copy Data
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* QR Search Modal */}
      <Modal
        title="Search Student by QR Code"
        visible={qrSearchVisible}
        footer={null}
        onCancel={handleQrSearchModalClose}
        width={600}
      >
        <div style={{ textAlign: "center", padding: 20 }}>
          {!cameraActive ? (
            <>
              <Upload
                accept="image/*"
                beforeUpload={handleQrSearch}
                showUploadList={false}
                fileList={fileList}
              >
                <Button 
                  type="primary" 
                  loading={uploading}
                  icon={<QrcodeOutlined />}
                  style={{ marginRight: 16 }}
                >
                  Upload QR Image
                </Button>
              </Upload>
              <Button 
                type="primary" 
                icon={<CameraOutlined />}
                onClick={startCamera}
              >
                Use Camera
              </Button>
            </>
          ) : (
            <>
              <div style={{ position: 'relative', margin: '0 auto', width: '100%', maxWidth: '500px' }}>
                <video 
                  ref={videoRef} 
                  style={{ 
                    width: '100%', 
                    border: '2px solid #1890ff',
                    borderRadius: '8px'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                }}>
                  <Button 
                    danger 
                    shape="circle" 
                    icon={<DeleteOutlined />} 
                    onClick={stopCamera}
                  />
                </div>
              </div>
              <p style={{ marginTop: 16, color: '#666' }}>
                Point your camera at a student QR code to scan
              </p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StudentManagement;