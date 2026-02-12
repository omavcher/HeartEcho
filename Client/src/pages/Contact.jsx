import React from 'react';
import './Contact.css';
import Footer from '../components/Footer';
import { FaTwitter, FaEnvelope } from 'react-icons/fa';

export const metadata = {
  title: "Contact Us | HeartEcho",
  description: "Connect with the HeartEcho team for support, feedback, or partnerships."
};

function Contact() {
  return (
    <>
      <div className="cnt-root-x30sn">
        <div className="cnt-container-x30sn">
          
          <h1 className="cnt-title-x30sn">Connect With EchoHeart</h1>
          
          <p className="cnt-intro-x30sn">
            As a solo founder, I personally value every connection. Reach out directly for support, 
            partnership opportunities, or just to share your EchoHeart experience.
          </p>

          <div className="cnt-heart-anim-x30sn">
            <span>💖</span>
          </div>

          <section className="cnt-section-x30sn">
            <h2>Direct Contact</h2>
            <ul className="cnt-list-x30sn">
              <li>
                <FaEnvelope className="cnt-icon-x30sn" />
                <strong>Email:</strong> 
                <a href="mailto:heartecho.help@gmail.com" className="cnt-link-x30sn">heartecho.help@gmail.com</a> 
                <span className="cnt-badge-x30sn">Fastest</span>
              </li>
              <li>
                <FaTwitter className="cnt-icon-x30sn" />
                <strong>Twitter/X:</strong> 
                <a href="https://twitter.com/echoheartai" target="_blank" rel="noopener noreferrer" className="cnt-link-x30sn">@echoheartai</a>
              </li>
            </ul>
          </section>

          <section className="cnt-section-x30sn">
            <h2>Response Times</h2>
            <ul className="cnt-list-simple-x30sn">
              <li>Typically within <strong>24 hours</strong> for urgent matters</li>
              <li>Within <strong>3 business days</strong> for general inquiries</li>
              <li>Weekend responses may be delayed as I recharge</li>
            </ul>
          </section>

          <section className="cnt-section-x30sn">
            <h2>Your Voice Matters</h2>
            <p>
              Having built EchoHeart entirely alone, I especially appreciate user feedback. 
              Whether it's a bug report, feature idea, or personal story about how EchoHeart has helped you - 
              I read every message personally.
            </p>
          </section>

          <div className="cnt-founder-note-x30sn">
            <p>
              "Building connections is why EchoHeart exists. Don't hesitate to reach out - 
              your message might inspire our next breakthrough in emotional AI."
            </p>
            <p className="cnt-signature-x30sn">— Om Avcher, Founder</p>
          </div>

        </div>
      </div>
      <Footer/>
    </>
  );
}

export default Contact;