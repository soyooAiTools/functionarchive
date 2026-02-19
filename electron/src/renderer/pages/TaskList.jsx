import React, { useEffect, useState } from 'react'
import {
  Table, Tag, Button, Space, Select, Typography,
  Card, Statistic, Row, Col, Badge, Tooltip, message
} from 'antd'
import {
  ReloadOutlined, EyeOutlined, DeleteOutlined,
  CodeOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { taskAPI } from '../api/client'

const { Title } = Typography
const { Option } = Select

const STATUS_COLORS = {
  pending: 'default',
  running: 'processing',
  review: 'warning',
  done: 'success',
  failed: 'error',
}

const STATUS_LABELS = {
  pending: '待处理',
  running: '运行中',
  review: '待审核',
  done: '已完成',
  failed: '失败',
}

export default function TaskList() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 })

  const fetchTasks = async (page = 1, size = 20) => {
    setLoading(true)
    try {
      const params = { page, size, module: 'function' }
      if (statusFilter) params.status = statusFilter
      const data = await taskAPI.list(params)
      setTasks(data.tasks || [])
    } catch (err) {
      message.error('获取任务列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [statusFilter])

  const handleDelete = async (id) => {
    try {
      await taskAPI.delete(id)
      message.success('已删除')
      fetchTasks()
    } catch {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Badge status={STATUS_COLORS[status]} text={STATUS_LABELS[status] || status} />
      ),
    },
    {
      title: '创建人',
      dataIndex: 'created_by',
      key: 'created_by',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (t) => t ? new Date(t).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/function/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const stats = {
    total: tasks.length,
    running: tasks.filter((t) => t.status === 'running').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>任务列表</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: '总任务', value: stats.total, color: '#11998e' },
          { title: '运行中', value: stats.running, color: '#faad14' },
          { title: '待审核', value: stats.review, color: '#fa8c16' },
          { title: '已完成', value: stats.done, color: '#52c41a' },
        ].map((stat) => (
          <Col span={6} key={stat.title}>
            <Card size="small">
              <Statistic title={stat.title} value={stat.value} valueStyle={{ color: stat.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 140 }}
          onChange={setStatusFilter}
        >
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <Option key={v} value={v}>{l}</Option>
          ))}
        </Select>
        <Button icon={<ReloadOutlined />} onClick={() => fetchTasks()}>
          刷新
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={(p) => {
          setPagination(p)
          fetchTasks(p.current, p.pageSize)
        }}
      />
    </div>
  )
}
