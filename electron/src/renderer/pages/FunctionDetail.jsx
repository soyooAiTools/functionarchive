import React, { useEffect, useState } from 'react'
import {
  Card, Typography, Descriptions, Badge, Button, Space,
  message, Spin, Tag, Image
} from 'antd'
import {
  CodeOutlined, RollbackOutlined, PlayCircleOutlined,
  ReloadOutlined, CheckOutlined
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { taskAPI, functionAPI, createWSConnection } from '../api/client'

const { Title, Paragraph, Text } = Typography

const STATUS_MAP = {
  pending: { status: 'default', text: '待处理' },
  running: { status: 'processing', text: '运行中' },
  review: { status: 'warning', text: '待审核' },
  done: { status: 'success', text: '已完成' },
  failed: { status: 'error', text: '失败' },
}

export default function FunctionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [diff, setDiff] = useState(null)

  const fetchTask = async () => {
    try {
      const data = await taskAPI.get(id)
      setTask(data)
    } catch {
      message.error('获取任务详情失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchDiff = async () => {
    try {
      const data = await functionAPI.diff(id)
      setDiff(data)
    } catch {
      // diff 可能还没生成
    }
  }

  useEffect(() => {
    fetchTask()
    fetchDiff()

    const ws = createWSConnection((msg) => {
      if (msg.task_id === id) {
        fetchTask()
        if (msg.type === 'status' && (msg.status === 'review' || msg.status === 'done')) {
          fetchDiff()
        }
      }
    })

    return () => ws.close()
  }, [id])

  const handleRun = async () => {
    setActionLoading(true)
    try {
      await functionAPI.run(id)
      message.success('任务已启动')
      fetchTask()
    } catch (err) {
      message.error(err?.error || '启动失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRetry = async () => {
    setActionLoading(true)
    try {
      await functionAPI.retry(id)
      message.success('已重新启动')
      fetchTask()
    } catch (err) {
      message.error(err?.error || '重试失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCommit = async () => {
    setActionLoading(true)
    try {
      await functionAPI.commit(id)
      message.success('已提交到 SVN')
      fetchTask()
    } catch (err) {
      message.error(err?.error || '提交失败')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!task) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">任务不存在</Text>
      </div>
    )
  }

  const statusInfo = STATUS_MAP[task.status] || { status: 'default', text: task.status }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <Space align="center" style={{ marginBottom: 24 }}>
        <CodeOutlined style={{ fontSize: 24, color: '#11998e' }} />
        <Title level={4} style={{ margin: 0 }}>任务详情</Title>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="项目名称" span={2}>
            {task.title}
          </Descriptions.Item>
          <Descriptions.Item label="SVN 地址" span={2}>
            <Text copyable>{task.svn_url}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Badge status={statusInfo.status} text={statusInfo.text} />
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {task.created_at ? new Date(task.created_at).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建人">
            {task.created_by || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Worker">
            {task.worker_id ? <Tag color="blue">{task.worker_id}</Tag> : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 功能描述 */}
      <Card title="功能描述" size="small" style={{ marginBottom: 16 }}>
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {task.func_desc || task.bug_desc || '无描述'}
        </Paragraph>
      </Card>

      {/* 参考图片 */}
      {task.images && task.images.length > 0 && (
        <Card title="参考图片" size="small" style={{ marginBottom: 16 }}>
          <Image.PreviewGroup>
            <Space wrap>
              {task.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={img.url}
                  width={150}
                  height={150}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        </Card>
      )}

      {/* Diff 预览 */}
      {diff && (
        <Card title="代码变更" size="small" style={{ marginBottom: 16 }}>
          <pre style={{
            background: '#f5f5f5',
            padding: 16,
            borderRadius: 8,
            maxHeight: 500,
            overflow: 'auto',
            fontSize: 12,
            lineHeight: 1.6,
          }}>
            {diff.content || '暂无变更'}
          </pre>
        </Card>
      )}

      {/* 操作按钮 */}
      <Space>
        {task.status === 'pending' && (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={actionLoading}
            onClick={handleRun}
          >
            启动任务
          </Button>
        )}
        {task.status === 'failed' && (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={actionLoading}
            onClick={handleRetry}
          >
            重试
          </Button>
        )}
        {task.status === 'review' && (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={actionLoading}
            onClick={handleCommit}
          >
            确认提交到 SVN
          </Button>
        )}
        <Button
          icon={<RollbackOutlined />}
          onClick={() => navigate('/tasks')}
        >
          返回列表
        </Button>
      </Space>
    </div>
  )
}
