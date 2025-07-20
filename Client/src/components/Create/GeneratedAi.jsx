'use client';

import { useState } from 'react';
import "./GeneratedAi.css";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from "axios";
import api from "../../config/api";
import PopNoti from '../PopNoti';
import Image from 'next/image';

const GeneratedAi = ({ generatedData }) => {
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const router = useRouter();
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const handleSendMessage = async () => {
        try {
            const response = await axios.get(`${api.Url}/user/user-type`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.user_type === 'free') {
                setNotification({ show: true, message: 'You need a subscription to send messages.', type: 'info' });
                setTimeout(() => {
                    router.push('/subscribe');
                }, 2000);
            }
            if (response.data.user_type === 'subscribed') {
                const aiResponse = await axios.post(`${api.Url}/ai/createaifriend`, { generatedData }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const aiFriendId = aiResponse.data.friend._id;
                router.push(`/chatbox?chatId=${aiFriendId}`);
            }
        } catch (error) {
            setNotification({ show: true, message: 'An error occurred. Please try again.', type: 'error' });
        }
    };

    if (!generatedData) {
        return <p className="no-character-ainergenrated">No character generated yet.</p>;
    }

    return (
        <div className="chat-containergenrated">
            <PopNoti
                message={notification.message}
                type={notification.type}
                isVisible={notification.show}
                onClose={() => setNotification({ ...notification, show: false })}
            />
            <div className="chat-headerinergenrated">
                <div className="profile-pic-ainergenrated">
                    {generatedData.Image ? (
                        <Image 
                            src={generatedData.Image} 
                            alt="Character Avatar" 
                            width={100}
                            height={100}
                        />
                    ) : (
                        <div className="placeholder-img-ainergenrated">No Image</div>
                    )}
                </div>
                <div className="profile-info-ainergenrated">
                    <h3>{generatedData.PersonaData.selectedName}</h3>
                    <Link href='/subscribe' className='subscribe-btn-x'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.80577 5.20006L7.00505 7.99958L11.1913 2.13881C11.5123 1.6894 12.1369 1.58531 12.5863 1.90631C12.6761 1.97045 12.7546 2.04901 12.8188 2.13881L17.0051 7.99958L21.2043 5.20006C21.6639 4.89371 22.2847 5.01788 22.5911 5.47741C22.7228 5.67503 22.7799 5.91308 22.7522 6.14895L21.109 20.1164C21.0497 20.62 20.6229 20.9996 20.1158 20.9996H3.8943C3.38722 20.9996 2.9604 20.62 2.90115 20.1164L1.25792 6.14895C1.19339 5.60045 1.58573 5.10349 2.13423 5.03896C2.37011 5.01121 2.60816 5.06832 2.80577 5.20006ZM12.0051 14.9996C13.1096 14.9996 14.0051 14.1042 14.0051 12.9996C14.0051 11.895 13.1096 10.9996 12.0051 10.9996C10.9005 10.9996 10.0051 11.895 10.0051 12.9996C10.0051 14.1042 10.9005 14.9996 12.0051 14.9996Z"></path>
                        </svg>
                        Subscribe
                    </Link>
                </div>
            </div>
            <div className="chat-body-ainergenrated">
                <div className="message-ainergenrated received-ainergenrated">
                    <p><strong>Gender:</strong> {generatedData.Gender}</p>
                    <p><strong>Age Group:</strong> {generatedData.AgeGroup}</p>
                    <p><strong>Relationship:</strong> {generatedData.Relationship}</p>
                    <p><strong>Interests:</strong> {generatedData.Interests.join(", ")}</p>
                    <p>
                        <strong>Personality:</strong>{" "}
                        {Object.entries(generatedData.PersonalityTraits)
                            .map(([trait, value]) => `${trait}: ${value}`)
                            .join(", ")}
                    </p>
                </div>
            </div>
            <div className="chat-footer-ainergenrated">
                <button className="send-btn-ainergenrated" onClick={handleSendMessage}>Send message</button>
            </div>
        </div>
    );
};

export default GeneratedAi;