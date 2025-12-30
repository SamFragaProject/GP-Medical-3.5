import React from 'react'
import { Outlet } from 'react-router-dom'

export function Layout({ children }: { children?: React.ReactNode }) {
    console.log('LayoutTest rendering')
    return (
        <div style={{ padding: 20, border: '2px solid green' }}>
            <h1>LayoutTest</h1>
            {children || <Outlet />}
        </div>
    )
}
