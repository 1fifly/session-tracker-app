import React from "react";
import { Route, createHashRouter, createRoutesFromElements, RouterProvider, useLocation } from 'react-router-dom';
import Dashboard from "./pages/Dashboard.jsx";
import Sessions from "./pages/Sessions.jsx";
import Settings from "./pages/Settings.jsx";
import MainLayout from "./layouts/MainLayout.jsx";



const router = createHashRouter(
  createRoutesFromElements(
    <Route path='/' element={ <MainLayout /> }>
        <Route index element={ <Dashboard /> } />
        <Route path='/settings' element={ <Settings /> } />
        <Route path='/sessions' element={ <Sessions /> } />
        <Route path='/sessions/new' element={ <Sessions /> } />
        <Route path='/sessions/insights' element={ <Sessions /> } />
    </Route>
  )
);

export default function App() {
  return (
    <RouterProvider router={ router } />
  );
}