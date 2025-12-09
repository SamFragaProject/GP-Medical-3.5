import React from 'react'
import { Outlet } from 'react-router-dom'
import { SpectacularSidebar } from '@/components/navigation/SpectacularSidebar'
import { ChatbotSuperinteligente } from '@/components/ChatbotSuperinteligente'
import { Toaster } from 'react-hot-toast'

export function LayoutPremium() {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <SpectacularSidebar />

            <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out relative z-0">
                <div className="container mx-auto p-6">
                    <Outlet />
                </div>
            </main>

            {/* Chatbot flotante */}
            {/* <div className="fixed bottom-6 right-6 z-50">
                <ChatbotSuperinteligente />
            </div> */}

            <Toaster position="top-right" />
        </div>
    )
}
