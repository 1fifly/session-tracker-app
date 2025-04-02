import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import TitleBar from '../components/TitleBar.jsx';

export default function MainLayout() {
  return (
    <div className='flex flex-col h-screen'>
        <TitleBar />
        <Header/>
        <Outlet/>
        <Navbar/>
    </div>
  )
}
