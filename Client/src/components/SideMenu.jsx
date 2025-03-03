import React from 'react'
import '../styles/SideMenu.css'
import { Link } from 'react-router-dom'
function SideMenu() {
  return (
    <div className='side-menu-container'>
           <img src='/heartechor.png' alt='HeartEcho Logo' className='side-menu-logo' />

           <div className='side-menu-links'>
            <span> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
</svg>
 </span>


              <Link className='side-men-cdf4' to='/'> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" d="M1.5 14.5v-8l6.5-5 6.5 5v8h-13Z"/><path stroke="currentColor" d="M6.5 14.5v-5h3v5"/></svg></Link>
              <Link className='side-men-cdf4' to='/discover'> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 1V2H7C5.34315 2 4 3.34315 4 5V8C4 10.7614 6.23858 13 9 13H15C17.7614 13 20 10.7614 20 8V5C20 3.34315 18.6569 2 17 2H13V1H11ZM6 5C6 4.44772 6.44772 4 7 4H17C17.5523 4 18 4.44772 18 5V8C18 9.65685 16.6569 11 15 11H9C7.34315 11 6 9.65685 6 8V5ZM9.5 9C10.3284 9 11 8.32843 11 7.5C11 6.67157 10.3284 6 9.5 6C8.67157 6 8 6.67157 8 7.5C8 8.32843 8.67157 9 9.5 9ZM14.5 9C15.3284 9 16 8.32843 16 7.5C16 6.67157 15.3284 6 14.5 6C13.6716 6 13 6.67157 13 7.5C13 8.32843 13.6716 9 14.5 9ZM6 22C6 18.6863 8.68629 16 12 16C15.3137 16 18 18.6863 18 22H20C20 17.5817 16.4183 14 12 14C7.58172 14 4 17.5817 4 22H6Z"></path></svg>  </Link>
              <Link className='side-men-cdf4' to='/chatbox'> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" d="M1.5 10.5v-9h10v7h-8l-2 2Z"/><path stroke="currentColor" d="M11.5 5.5h3v9l-2-2h-8v-4"/></svg></Link>
              <Link className='side-men-cdf4' to='/profile'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" d="M8 9.5H5.232a3 3 0 0 0-2.873 2.138L1.5 14.5H9"/><circle cx="8" cy="4.5" r="3" stroke="currentColor"/><path fill="currentColor" d="m11.5 7.5 1.131 2.869L15.5 11.5l-2.869 1.131L11.5 15.5l-1.131-2.869L7.5 11.5l2.869-1.131L11.5 7.5Z"/></svg>  </Link>


            </div>
    </div>
  )
}

export default SideMenu