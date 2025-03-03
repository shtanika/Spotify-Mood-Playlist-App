import React from 'react'
import { NAVBAR_HEIGHT } from '../lib/constants'
import Navbar from '@/components/Navbar'

const Layout = ({ children }) => {
  return (
    <div> 
        <Navbar />
        <main style={{ paddingTop: `${NAVBAR_HEIGHT}px` }} className="h-full flex w-full flex-col">
            {children}
        </main>
    </div>
  )
}

export default Layout