import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ProLayout } from '@ant-design/pro-components'
import { Dropdown, message } from 'antd'
import {
  CodeOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons'
import Login from './pages/Login'
import TaskList from './pages/TaskList'
import FunctionCreate from './pages/FunctionCreate'
import FunctionDetail from './pages/FunctionDetail'

const menuRoutes = [
  {
    path: '/tasks',
    name: '任务列表',
    icon: <UnorderedListOutlined />,
  },
  {
    path: '/function',
    name: 'FunctionArchive',
    icon: <CodeOutlined />,
    routes: [
      { path: '/function/create', name: '新建功能任务' },
    ],
  },
]

function PrivateLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const username = localStorage.getItem('username') || 'User'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
    message.success('已退出登录')
  }

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  }

  return (
    <ProLayout
      title="FunctionArchive"
      logo={null}
      route={{ path: '/', routes: menuRoutes }}
      location={{ pathname: location.pathname }}
      menuItemRender={(item, dom) => (
        <a onClick={() => navigate(item.path)}>{dom}</a>
      )}
      subMenuItemRender={(item, dom) => dom}
      avatarProps={{
        src: null,
        icon: <UserOutlined />,
        title: username,
        render: (props, dom) => (
          <Dropdown menu={userMenu}>
            <span style={{ cursor: 'pointer' }}>{dom}</span>
          </Dropdown>
        ),
      }}
      style={{ minHeight: '100vh' }}
    >
      <Routes>
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/function/create" element={<FunctionCreate />} />
        <Route path="/function/:id" element={<FunctionDetail />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </ProLayout>
  )
}

function RequireAuth({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <PrivateLayout />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
