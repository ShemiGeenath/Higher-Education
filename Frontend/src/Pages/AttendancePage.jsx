import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Table, 
  Tag, 
  Modal, 
  Select, 
  Input, 
  Space, 
  message,
  Avatar,
  Descriptions,
  Divider,
  Badge
} from 'antd';
import { 
  QrcodeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  ScanOutlined
} from '@ant-design/icons';
import QrScanner from 'qr-scanner';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

const AttendancePage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [status, setStatus] = useState('present');
  const [notes, setNotes] = useState('');
  const [qrScanner, setQrScanner] = useState(null);

  // Fetch student data and their classes
  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
    return () => {
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }
    };
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [studentRes, attendanceRes] = await Promise.all([
        axios.get(`/api/students/${studentId}`),
        axios.get(`/api/attendance/student/${studentId}?from=${moment().subtract(30, 'days').format('YYYY-MM-DD')}`)
      ]);

      setStudent(studentRes.data);
      setAttendance(attendanceRes.data);
      setClasses(studentRes.data.enrolledClasses
        .filter(ec => ec.active !== false)
        .map(ec => ec.class)
      );
    } catch (error) {
      message.error('Failed to fetch student data');
    }
    setLoading(false);
  };

  // Handle QR scan
  const startScanner = () => {
    setScanning(true);
    const scanner = new QrScanner(
      videoRef.current,
      result => {
        try {
          const data = JSON.parse(result.data);
          if (data.studentId) {
            navigate(`/attendance/${data.studentId}`);
          }
        } catch (e) {
          message.error('Invalid QR code');
        }
        stopScanner();
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );
    scanner.start();
    setQrScanner(scanner);
  };

  const stopScanner = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
    setScanning(false);
  };

  // Mark attendance
  const markAttendance = async () => {
    if (!selectedClass) {
      message.error('Please select a class');
      return;
    }

    try {
      const response = await axios.post('/api/attendance/scan', {
        studentId,
        classId: selectedClass,
        status,
        notes
      });

      message.success('Attendance marked successfully');
      fetchStudentData();
      setSelectedClass(null);
      setNotes('');
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to mark attendance');
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      present: { icon: <CheckCircleOutlined />, color: 'green', text: 'Present' },
      absent: { icon: <CloseCircleOutlined />, color: 'red', text: 'Absent' },
      late: { icon: <ClockCircleOutlined />, color: 'orange', text: 'Late' },
      excused: { icon: <UserOutlined />, color: 'blue', text: 'Excused' }
    };

    const current = statusMap[status] || { icon: null, color: 'default', text: status };
    return (
      <Tag icon={current.icon} color={current.color}>
        {current.text}
      </Tag>
    );
  };

  if (loading && !student) {
    return <div>Loading student data...</div>;
  }

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Student Attendance"
        extra={
          <Button 
            type="primary" 
            icon={<ScanOutlined />} 
            onClick={scanning ? stopScanner : startScanner}
          >
            {scanning ? 'Stop Scanner' : 'Scan QR Code'}
          </Button>
        }
      >
        {scanning && (
          <Modal
            title="Scan Student QR Code"
            visible={scanning}
            onCancel={stopScanner}
            footer={null}
            width={500}
          >
            <video 
              ref={videoRef} 
              style={{ width: '100%', border: '1px solid #ddd', borderRadius: 4 }}
            />
            <p style={{ textAlign: 'center', marginTop: 16 }}>
              Point the camera at the student's QR code
            </p>
          </Modal>
        )}

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Name">{student.name}</Descriptions.Item>
          <Descriptions.Item label="NIC">{student.nic}</Descriptions.Item>
          <Descriptions.Item label="School">{student.schoolName}</Descriptions.Item>
          <Descriptions.Item label="Stream">
            <Tag color="blue">{student.stream}</Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Mark Attendance</Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            placeholder="Select Class"
            style={{ width: '100%' }}
            onChange={setSelectedClass}
            value={selectedClass}
          >
            {classes.map(cls => (
              <Option key={cls._id} value={cls._id}>
                {cls.className} - {cls.subject} ({cls.day} {cls.time})
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Select Status"
            style={{ width: '100%' }}
            onChange={setStatus}
            value={status}
          >
            <Option value="present">Present</Option>
            <Option value="absent">Absent</Option>
            <Option value="late">Late</Option>
            <Option value="excused">Excused</Option>
          </Select>

          <Input.TextArea
            placeholder="Notes (optional)"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <Button 
            type="primary" 
            onClick={markAttendance}
            disabled={!selectedClass}
            block
          >
            Mark Attendance
          </Button>
        </Space>

        <Divider orientation="left">Recent Attendance</Divider>

        <Table
          columns={[
            {
              title: 'Date',
              dataIndex: 'date',
              render: date => moment(date).format('YYYY-MM-DD HH:mm'),
              sorter: (a, b) => new Date(a.date) - new Date(b.date),
            },
            {
              title: 'Class',
              dataIndex: ['class', 'className'],
            },
            {
              title: 'Subject',
              dataIndex: ['class', 'subject'],
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: getStatusTag,
            },
            {
              title: 'Marked By',
              dataIndex: ['markedBy', 'name'],
            },
            {
              title: 'Notes',
              dataIndex: 'notes',
              render: notes => notes || '-',
            }
          ]}
          dataSource={attendance}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default AttendancePage;