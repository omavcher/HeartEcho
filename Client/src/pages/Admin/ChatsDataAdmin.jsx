import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import api from "../../config/api";

function ChatsDataAdmin() {
    const [chatData, setChatData] = useState([]);
    const [timePeriod, setTimePeriod] = useState("all"); // Assuming you need this for the request

    const getToken = useCallback(() => {
        if (typeof window !== 'undefined') return localStorage.getItem("token") || "";
        return "";
    }, []);

    useEffect(() => {
        async function fetchChatData() {
            try {
                const token = getToken();
                // Axios GET requests take params in a config object, not as a second argument
                const response = await axios.get(`${api.Url}/admin/chats-data`, {
                    params: { timePeriod }, 
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                });

                // Update state with the fetched data
                setChatData(response.data); 
            } catch (error) {
                console.error('Error fetching chat data:', error);
            }
        }

        fetchChatData();
    }, [getToken, timePeriod]); // Added dependencies

    return (
        <div>
            <h1>Chats Data</h1>
            {chatData.length === 0 ? (
                <p>No chat data available.</p>
            ) : (
                <table border="1" style={{ width: '100%', textAlign: 'left' }}>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Message</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chatData.map((chat, index) => (
                            <tr key={chat.id || index}>
                                <td>{chat.userId}</td>
                                <td>{chat.message}</td>
                                <td>{new Date(chat.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ChatsDataAdmin;