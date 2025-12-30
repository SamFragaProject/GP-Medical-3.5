import React from 'react'
import { Outlet } from 'react-router-dom'

export function Layout({ children }: { children?: React.ReactNode }) {
  console.log('Minimal Layout rendering')
  return (
    <div style={{ padding: 20, border: '2px solid red' }}>
      <h1>Minimal Layout</h1>
      {children || <Outlet />}
    </div>
  )
}
