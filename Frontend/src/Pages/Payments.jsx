// 👇 All imports remain unchanged
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Table, 
  Card, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Modal, 
  message, 
  Divider, 
  Tabs, 
  Tag,
  Statistic,
  Descriptions,
  Empty,
  Image,
  Avatar,
  Input,
  InputNumber,
  Form
} from 'antd';
import { 
  MoneyCollectOutlined, 
  UserOutlined, 
  CalendarOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  SolutionOutlined,
  BookOutlined,
  DollarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const { TabPane } = Tabs;
const { Option } = Select;
const { MonthPicker } = DatePicker;
const { TextArea } = Input;

const Payments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);
  const [unenrollModalVisible, setUnenrollModalVisible] = useState(false);
  const [classToUnenroll, setClassToUnenroll] = useState(null);
  const [paymentForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('payments');

  useEffect(() => {
    fetchStudentData();
    fetchClasses();
    fetchTeachers();
  }, [id]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [studentRes, paymentsRes, attendanceRes] = await Promise.all([
        axios.get(`/api/students/${id}`),
        axios.get(`/api/payments/student/${id}`),
        axios.get(`/api/attendance/student/${id}`)
      ]);

      setStudent(studentRes.data);
      setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
      setAttendance(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
    } catch (err) {
      message.error('Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/classes');
      setClasses(res.data);
    } catch (err) {
      message.error('Failed to fetch classes');
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/api/teachers');
      setTeachers(res.data);
    } catch (err) {
      message.error('Failed to fetch teachers');
    }
  };

  const handlePaymentSubmit = async (values) => {
    try {
      await axios.post('/api/payments', {
        studentId: id,
        classId: values.classId,
        amount: values.amount,
        month: values.month.format('YYYY-MM'),
        notes: values.notes
      });

      message.success('Payment recorded successfully');
      setPaymentModalVisible(false);
      fetchStudentData();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to record payment');
    }
  };

  const handleEnrollSubmit = async () => {
    if (!selectedClass) {
      message.error('Please select a class');
      return;
    }

    try {
      await axios.post(`/api/students/${id}/enroll`, {
        classId: selectedClass
      });

      message.success('Student enrolled successfully');
      setEnrollModalVisible(false);
      fetchStudentData();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to enroll student');
    }
  };

  const handleUnenrollSubmit = async () => {
    try {
      await axios.post(`/api/students/${id}/unenroll`, {
        classId: classToUnenroll
      });

      message.success('Student unenrolled successfully');
      setUnenrollModalVisible(false);
      fetchStudentData();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to unenroll student');
    }
  };

  const paymentSummaryData = Array.isArray(payments)
    ? payments.reduce((acc, payment) => {
        const existing = acc.find(item => item._id === payment.month);
        if (existing) {
          existing.totalPaid += payment.amount;
          existing.payments.push(payment);
        } else {
          acc.push({
            _id: payment.month,
            totalPaid: payment.amount,
            payments: [payment]
          });
        }
        return acc;
      }, []).sort((a, b) => b._id.localeCompare(a._id))
    : [];

  const totalPayments = Array.isArray(payments)
    ? payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)
    : '0.00';

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={student?.profilePicture ? `/uploads/${student.profilePicture}` : null} 
                  icon={<UserOutlined />}
                  style={{ marginRight: 12 }}
                />
                <span>{student?.name}'s Academic Records</span>
              </div>
            }
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setEnrollModalVisible(true)}
              >
                Enroll in New Class
              </Button>
            }
          >
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Student Name">{student?.name}</Descriptions.Item>
              <Descriptions.Item label="NIC">{student?.nic}</Descriptions.Item>
              <Descriptions.Item label="School">{student?.schoolName}</Descriptions.Item>
              <Descriptions.Item label="Age">{student?.age}</Descriptions.Item>
              <Descriptions.Item label="Contact">{student?.contact}</Descriptions.Item>
              <Descriptions.Item label="Email">{student?.email}</Descriptions.Item>
              <Descriptions.Item label="Stream">{student?.stream}</Descriptions.Item>
              <Descriptions.Item label="Guardian">{student?.guardianName || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Guardian Contact">{student?.guardianContact || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Admission Date">
                {student?.admissionDate ? moment(student.admissionDate).format('LL') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Enrolled Classes">
                {student?.enrolledClasses?.filter(ec => ec.active).length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Total Payments">
                Rs. {totalPayments}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={24}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={<span><DollarOutlined /> Payment History</span>} key="payments">
              <Card>
                {payments.length > 0 ? (
                  <Table 
                    columns={paymentColumns} 
                    dataSource={payments} 
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No payment records found">
                    <Button type="primary" onClick={() => setPaymentModalVisible(true)}>
                      Record First Payment
                    </Button>
                  </Empty>
                )}
              </Card>
            </TabPane>

            <TabPane tab={<span><SolutionOutlined /> Attendance</span>} key="attendance">
              <Card>
                {attendance.length > 0 ? (
                  <Table 
                    columns={attendanceColumns} 
                    dataSource={attendance} 
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No attendance records found" />
                )}
              </Card>
            </TabPane>

            <TabPane tab={<span><BookOutlined /> Enrolled Classes</span>} key="classes">
              <Card>
                {student?.enrolledClasses?.length > 0 ? (
                  <Table 
                    columns={enrolledClassesColumns} 
                    dataSource={student.enrolledClasses} 
                    rowKey={record => record.class?._id || record._id}
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No enrolled classes">
                    <Button type="primary" onClick={() => setEnrollModalVisible(true)}>
                      Enroll in a Class
                    </Button>
                  </Empty>
                )}
              </Card>
            </TabPane>

            <TabPane tab={<span><CalendarOutlined /> Payment Summary</span>} key="summary">
              <Card>
                {paymentSummaryData.length > 0 ? (
                  <Table 
                    columns={paymentSummaryColumns} 
                    dataSource={paymentSummaryData}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No payment records found" />
                )}
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* 🔻 Keep your Modals, Payment Form, and all other sections unchanged */}
      {/* ✅ All previous logic, modals, and inputs remain the same */}
    </div>
  );
};

export default Payments;
