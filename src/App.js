
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Navibar from "./components/Navibar";
import EmployeeList from './components/EmployeeList';
import Transaction from './components/Transaction';
import EditTransaction from './components/EditTransaction';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import CalendarView from './components/CalendarView';
import CalViewDetail from './components/CalViewDetail';
import Earning from './components/Earning';
import User from './components/User'
import useLocalState from './components/useLocalState';
import SaleReport from './components/SaleReport';
import SignUp from './components/SignUp';
import { HelmetProvider } from 'react-helmet-async';
import Test from './components/Test';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

function App() {
  const [user,setUser] = useLocalState("","user");
  const mili = new Date().getTime() - 21600000;
  return(
    <>
      <BrowserRouter>
        <Navibar/>
        <HelmetProvider>
        <Routes>
            <Route path="/" element={<PrivateRoute><Transaction/></PrivateRoute>}></Route>
            <Route path="/transaction/:date" element={<PrivateRoute><Transaction/></PrivateRoute>}></Route>
            <Route index element={<PrivateRoute><Transaction/></PrivateRoute>}></Route>
            <Route path='/employeelist' element={<PrivateRoute><EmployeeList/></PrivateRoute>}/>
            <Route path='/user' element={<PrivateRoute> <User/> </PrivateRoute>}/>
            <Route path='/salereport' element={<PrivateRoute> <SaleReport/> </PrivateRoute>}/>
            <Route path='/earning' element={<PrivateRoute><Earning/></PrivateRoute>}></Route>
            <Route path='/calendarview' element={<PrivateRoute><CalendarView/></PrivateRoute>}/>
            <Route path='/calviewdetail' element={<PrivateRoute><CalViewDetail/></PrivateRoute>}/>
            <Route path='/edittransaction/:id' element={<PrivateRoute><EditTransaction/></PrivateRoute>}/>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/signup' element={<SignUp/>}/>
            <Route path='/test' element={<Test/>}/>
        </Routes>
        </HelmetProvider>
      </BrowserRouter>
    </>
  )
}

export default App;
