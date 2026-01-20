import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import api from "../../config/api";
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    Cell, PieChart, Pie, Legend 
} from 'recharts';
import './ChatsData.css';

function ChatsDataAdmin() {
    const [chatData, setChatData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [personaStats, setPersonaStats] = useState([]);
    const [systemMetrics, setSystemMetrics] = useState({ totalUsers: 0, totalMsgs: 0 });

    const fetchChatData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${api.Url}/admin/chats-data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.data;
            setChatData(data);
            processAnalytics(data);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChatData();
    }, [fetchChatData]);

    const processAnalytics = (data) => {
        const aiUsage = {};
        let msgCount = 0;

        data.forEach(userGroup => {
            userGroup.aiInteractions.forEach(inter => {
                const aiName = inter.aiFriend?.name || "Unknown AI";
                msgCount += inter.messages.length;
                
                if (!aiUsage[aiName]) {
                    aiUsage[aiName] = { name: aiName, usageCount: 0, totalMessages: 0 };
                }
                aiUsage[aiName].usageCount += 1;
                aiUsage[aiName].totalMessages += inter.messages.length;
            });
        });

        // Convert to array and sort by usage
        const sortedAi = Object.values(aiUsage).sort((a, b) => b.usageCount - a.usageCount);
        setPersonaStats(sortedAi);
        setSystemMetrics({ totalUsers: data.length, totalMsgs: msgCount });
    };

    const filtered = chatData.filter(u => 
        u.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

    if (loading) return <div className="loaderjdndm3">SYSTEM_ACCESS: GRANTED. LOADING_INTEL...</div>;

    return (
        <div className="pureBlackBodyjdndm3">
            <header className="statsHeaderjdndm3">
                <div className="titleBlockjdndm3">
                    <h1 className="neonTextjdndm3">STRATEGY COMMAND</h1>
                    <div className="miniStatsjdndm3">
                        <span>USERS: <b>{systemMetrics.totalUsers}</b></span>
                        <span>TOTAL_MSGS: <b>{systemMetrics.totalMsgs}</b></span>
                    </div>
                </div>
                <input 
                    className="searchInpjdndm3" 
                    placeholder="Search User Intel DB..." 
                    onChange={e => setSearchTerm(e.target.value)} 
                />
            </header>

            {/* NEW: Persona Leaderboard Section */}
            <div className="strategyRowjdndm3">
                <div className="personaChartBoxjdndm3">
                    <h3>AI PERSONA POPULARITY (Usage Frequency)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={personaStats.slice(0, 6)} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#fff" fontSize={12} width={100} />
                            <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                            <Bar dataKey="usageCount" radius={[0, 5, 5, 0]}>
                                {personaStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="personaTableBoxjdndm3">
                    <h3>PERSONA ENGAGEMENT RANKING</h3>
                    <table className="strategyTablejdndm3">
                        <thead>
                            <tr>
                                <th>RANK</th>
                                <th>AI PERSONA</th>
                                <th>USERS</th>
                                <th>TOTAL MSGS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personaStats.map((ai, idx) => (
                                <tr key={idx}>
                                    <td>#{idx + 1}</td>
                                    <td className="aiNameTdjdndm3">{ai.name}</td>
                                    <td>{ai.usageCount}</td>
                                    <td className="highlightTextjdndm3">{ai.totalMessages}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="gridAnalyticsjdndm3">
                {filtered.map(u => (
                    <div key={u.user.id} className="userCardjdndm3">
                        <div className="cardHeaderjdndm3">
                            <img src={u.user.profile_picture} alt="" className="userImgjdndm3" />
                            <div className="userMeta">
                                <h3>{u.user.name}</h3>
                                <span>{u.user.email}</span>
                                <div className={`tagjdndm3 ${u.user.user_type}jdndm3`}>{u.user.user_type.toUpperCase()}</div>
                            </div>
                        </div>

                        <div className="aiScrolljdndm3">
                            {u.aiInteractions.map((inter, idx) => (
                                <div key={idx} className="aiSessionjdndm3">
                                    <div className="aiLabeljdndm3">
                                        <img src={inter.aiFriend?.avatar_img} alt="" className="smallAvjdndm3" />
                                        <span>TARGET AI: <b>{inter.aiFriend?.name || "REDACTED"}</b></span>
                                    </div>
                                    <div className="messageStreamjdndm3">
                                        {inter.messages.map((m, mi) => (
                                            <div key={mi} className="bubblejdndm3">
                                                <small>{new Date(m.time).toLocaleTimeString()}</small>
                                                <p>{m.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatsDataAdmin;