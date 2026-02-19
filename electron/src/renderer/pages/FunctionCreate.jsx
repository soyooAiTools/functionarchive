import React, { useState } from 'react'
import {
  Form, Input, Button, Card, message, Typography,
  Space, Alert, Upload
} from 'antd'
import {
  CodeOutlined, SendOutlined, RollbackOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { functionAPI } from '../api/client'

const { Title, Text } = Typography
const { TextArea } = Input

export default function FunctionCreate() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [createdTask, setCreatedTask] = useState(null)
  const [fileList, setFileList] = useState([])
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // 1. 创建任务
      const task = await functionAPI.create({
        title: values.title,
        svn_url: values.svn_url,
        func_desc: values.func_desc,
      })

      // 2. 上传参考图片（如果有）
      if (fileList.length > 0) {
        const files = fileList.map((f) => f.originFileObj)
        await functionAPI.uploadImages(task.id, files)
      }

      setCreatedTask(task)
      message.success('任务创建成功！')
      form.resetFields()
      setFileList([])
    } catch (err) {
      message.error(err?.error || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRun = async () => {
    if (!createdTask) return
    setLoading(true)
    try {
      await functionAPI.run(createdTask.id)
      message.success('任务已启动，Worker 编码中...')
      navigate('/tasks')
    } catch (err) {
      message.error(err?.error || '启动失败：无可用 Worker')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps = {
    listType: 'picture-card',
    fileList,
    onChange: ({ fileList: newList }) => setFileList(newList),
    beforeUpload: () => false, // 手动上传，不自动发请求
    accept: 'image/*',
    multiple: true,
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <Space align="center" style={{ marginBottom: 24 }}>
        <CodeOutlined style={{ fontSize: 24, color: '#11998e' }} />
        <Title level={4} style={{ margin: 0 }}>新建功能实现任务</Title>
      </Space>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
        >
          <Form.Item
            label="项目名称"
            name="title"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="例：休闲消除游戏试玩广告" maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            label="SVN 地址"
            name="svn_url"
            rules={[
              { required: true, message: '请输入 SVN 仓库地址' },
            ]}
            extra="示例：svn://47.101.191.213:3690/repos/project-name"
          >
            <Input placeholder="svn://..." />
          </Form.Item>

          <Form.Item
            label="功能描述"
            name="func_desc"
            rules={[{ required: true, message: '请描述需要实现的功能' }]}
            extra="详细描述需要实现的功能、交互逻辑、预期效果，AI 会据此编码实现"
          >
            <TextArea
              rows={6}
              placeholder="描述需要实现的功能，例如：&#10;1. 点击按钮后播放粒子特效&#10;2. 添加倒计时 UI，3秒后自动跳转&#10;3. 实现左右滑动切换关卡的交互..."
              maxLength={5000}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="参考图片（选填）"
            extra="上传 UI 效果图、交互示意图等参考素材，帮助 AI 更好理解需求"
          >
            <Upload {...uploadProps}>
              {fileList.length >= 10 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
              >
                创建任务
              </Button>
              <Button
                icon={<RollbackOutlined />}
                onClick={() => navigate('/tasks')}
              >
                返回列表
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {createdTask && (
          <Alert
            type="success"
            message={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>
                  ✅ 任务创建成功：<Text code>{createdTask.id.slice(0, 8)}...</Text>
                </Text>
                <Text type="secondary">
                  点击「立即启动」将任务分配给空闲 Worker 开始 AI 编码。
                </Text>
                <Button
                  type="primary"
                  size="small"
                  loading={loading}
                  onClick={handleRun}
                >
                  立即启动
                </Button>
              </Space>
            }
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    </div>
  )
}
