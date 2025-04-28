import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Navibar from "./components/Navibar";
import Reset from './components/Reset';
import Email from './components/Email';
import Transaction from './components/Transaction';
import EditTransaction from './components/EditTransaction';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import CalendarView from './components/CalendarView';
import CalViewDetail from './components/CalViewDetail';
import Earning from './components/Earning';
import User from './components/User';
import SignUp from './components/SignUp';
import { HelmetProvider } from 'react-helmet-async';
import Test from './components/Test';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

function App() {
  return (
      <BrowserRouter>
        <Navibar />
        <HelmetProvider>
          <Routes>
            <Route path="*" element={<Transaction />}></Route>
            <Route path="/transaction/:date" element={<Transaction />}></Route>
            <Route index element={<Transaction />}></Route>
            <Route path='/user' element={ <User /> } />
            <Route path='/earning' element={<Earning />}></Route>
            <Route path='/calendarview' element={<CalendarView />} />
            <Route path='/calviewdetail' element={<CalViewDetail />} />
            <Route path='/edittransaction/:id' element={<EditTransaction />} />
            <Route path='/login' element={<Login />}></Route>
            <Route path='/reset' element={<Reset />}></Route>
            <Route path='/email' element={<Email />}></Route>
            <Route path='/signup' element={<SignUp />} />
            <Route path='/test' element={<Test />} />
          </Routes>
        </HelmetProvider>
      </BrowserRouter>
  );
}

export default App;
