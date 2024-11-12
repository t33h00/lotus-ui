import ReactDatePicker from "react-datepicker";
import DatePicker from "react-datepicker";
import React ,{useState} from "react";
import 'react-datepicker/dist/react-datepicker.css';

function Test(){

    const [startDate,setStartDate] = useState(new Date());
    console.log(startDate)

    return(
        <>
        <DatePicker
                showIcon
            selected={startDate}
            dateFormat="yyyy"
            onChange={(date) => setStartDate(date)}/>
        </>
    )
}
export default Test;
