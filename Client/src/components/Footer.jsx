import React from 'react'
import '../styles/Footer.css'
import { Link } from 'react-router-dom'
function Footer() {
  return (
<>
    <div className='footer-main-container'>
      <div className='leftc-footter-contex'>
             <div className='leftr-logo'><img src='/heartechor.png' alt='HeartEcho AI Logo'></img>Heart<span>Echo</span></div>

             <h6>Create Your Own AI Girlfriend – Smart, Personalized & Engaging</h6>
             <p>Secure & Private AI Conversations powered by advanced AI technology.</p>
             <p>Om Avcher Corp, Jalgaon Jamod, Maharashtra, India</p>
      </div>


    <div className='right-footer-nlings'>
        <span> 
        <Link className='footer-nav-sw'  to='/refund'>Refund</Link>
        <Link className='footer-nav-sw'  to='/privacy'>Privacy</Link>
        </span>

        <span> 

        <Link className='footer-nav-sw'  to='/terms'>Terms of use</Link>
        <Link className='footer-nav-sw'  to='/contact'>Contact us</Link>
        </span>
        <span> 

        <Link className='footer-nav-sw'  to='products'>Products</Link>
        <Link className='footer-nav-sw'  to='/shipping'>Shipping</Link>
        </span>

    </div>

    </div>
    <h6 className='rights-h6'>© {new Date().getFullYear()} HeartEcho AI. All Rights Reserved.</h6>
    </>
  )
}

export default Footer
