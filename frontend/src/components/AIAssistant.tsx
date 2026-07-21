'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './AIAssistant.module.css';
import type { Hackathon, Internship, Scholarship, CodingContest, StudentProfile } from '../data';

interface AIAssistantProps {
  hackathons: Hackathon[];
  internships: Internship[];
  scholarships: Scholarship[];
  contests: CodingContest[];
  profile: StudentProfile;
  onNavigateTab: (tabId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedOpportunities?: {
    type: 'hackathon' | 'internship' | 'scholarship' | 'contest';
    data: any;
  }[];
}

export default function AIAssistant({ hackathons, internships, scholarships, contests, profile, onNavigateTab }: AIAssistantProps) {
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${profile.name}! 👋 I am your intelligent Opportunity Assistant.

I can help you filter hackathons, verify scholarship eligibility, find internships, or check coding contest schedules. Try asking me:
• *"Suggest upcoming hackathons on Unstop."*
• *"Show scholarships for OBC category and annual income of ₹2 Lakh."*
• *"Suggest competitive programming contests on LeetCode or Codeforces."*`
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { label: "💡 Unstop & Devfolio Hackathons", text: "Suggest upcoming hackathons on Unstop and Devfolio." },
    { label: "🎓 OBC + ₹2 Lakh Scholarships", text: "I belong to OBC category and annual income is ₹2 Lakh. Show scholarships." },
    { label: "🏆 Codeforces / LeetCode Contests", text: "Find upcoming competitive programming contests this week." },
    { label: "💼 Remote Software Internships", text: "Find remote software internships on Wellfound or Internshala." }
  ];

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputMsg('');

    // Simulate AI thinking and replying
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let replyText = "";
      const recs: { type: 'hackathon' | 'internship' | 'scholarship' | 'contest'; data: any }[] = [];

      // 1. Coding Contest logic
      if (lower.includes('contest') || lower.includes('codeforces') || lower.includes('leetcode') || lower.includes('codechef') || lower.includes('atcoder') || lower.includes('competitive') || lower.includes('programming')) {
        let matches = contests;
        if (lower.includes('leetcode')) {
          matches = contests.filter(c => c.contestPlatform === 'LeetCode');
        } else if (lower.includes('codeforces')) {
          matches = contests.filter(c => c.contestPlatform === 'Codeforces');
        } else if (lower.includes('codechef')) {
          matches = contests.filter(c => c.contestPlatform === 'CodeChef');
        }
        replyText = `I found **${matches.length} coding contests** scheduled. These are great for practicing DSA and boosting your ratings:`;
        matches.forEach(m => recs.push({ type: 'contest', data: m }));
      }
      
      // 2. Hackathon Suggestion logic
      else if (lower.includes('hackathon') || lower.includes('python') || lower.includes('html') || lower.includes('react') || lower.includes('web') || lower.includes('unstop') || lower.includes('devpost')) {
        let matches = hackathons;
        if (lower.includes('unstop')) {
          matches = hackathons.filter(h => h.platform.toLowerCase().includes('unstop'));
        } else if (lower.includes('devpost')) {
          matches = hackathons.filter(h => h.platform.toLowerCase().includes('devpost'));
        } else {
          matches = hackathons.filter(h => 
            h.tags.some(tag => lower.includes(tag.toLowerCase())) ||
            h.title.toLowerCase().includes(lower) ||
            h.description.toLowerCase().includes(lower)
          );
        }

        if (matches.length === 0) {
          matches = hackathons.slice(0, 3);
        }

        replyText = `Based on your query, here are the top matching **hackathons** from platforms like Unstop, Devpost, and Devfolio:`;
        matches.forEach(m => recs.push({ type: 'hackathon', data: m }));
      }
      
      // 3. Scholarship logic
      else if (lower.includes('scholarship') || lower.includes('obc') || lower.includes('sc') || lower.includes('st') || lower.includes('minority') || lower.includes('income') || lower.includes('lakh') || lower.includes('buddy4study')) {
        let category: any = profile.category;
        let income = profile.annualIncome;

        if (lower.includes('obc')) category = 'OBC';
        else if (lower.includes('sc')) category = 'SC';
        else if (lower.includes('st')) category = 'ST';
        else if (lower.includes('ews')) category = 'EWS';
        else if (lower.includes('general')) category = 'General';
        else if (lower.includes('minority')) category = 'Minority';

        const incomeMatch = lower.match(/(\d+)\s*(lakh|l)/);
        if (incomeMatch) {
          income = parseInt(incomeMatch[1]) * 100000;
        }

        const matches = scholarships.filter(s => {
          const matchesCategory = s.eligibility.categories.includes('All' as any) || s.eligibility.categories.includes(category);
          const matchesIncome = income <= s.eligibility.incomeLimit;
          return matchesCategory && matchesIncome;
        });

        replyText = `Based on **Category: ${category}** with an **Annual Income limit of ₹${(income/100000).toFixed(1)} Lakh**, you qualify for the following **scholarship programs** listed on NSP and Buddy4Study:`;
        matches.forEach(m => recs.push({ type: 'scholarship', data: m }));
      }

      // 4. Internship logic
      else if (lower.includes('internship') || lower.includes('ece') || lower.includes('electronics') || lower.includes('hardware') || lower.includes('isro') || lower.includes('drdo') || lower.includes('software') || lower.includes('stipend') || lower.includes('internshala') || lower.includes('wellfound')) {
        let matches = internships;

        if (lower.includes('ece') || lower.includes('electronics') || lower.includes('isro') || lower.includes('drdo')) {
          matches = internships.filter(i => i.field === 'ECE' || i.company.toLowerCase().includes('isro') || i.company.toLowerCase().includes('drdo'));
          replyText = `Found **${matches.length} space and engineering research internships** matching ECE requirements:`;
        } else if (lower.includes('internshala')) {
          matches = internships.filter(i => i.platform.toLowerCase().includes('internshala'));
          replyText = `Found internship positions listed on **Internshala**:`;
        } else if (lower.includes('wellfound')) {
          matches = internships.filter(i => i.platform.toLowerCase().includes('wellfound'));
          replyText = `Found tech startup internship roles listed on **Wellfound**:`;
        } else {
          matches = internships.filter(i => i.field === 'Software' || i.field === 'AI');
          replyText = `Here are the top **recommended software & AI internships** matching your developer profile:`;
        }

        matches.forEach(m => recs.push({ type: 'internship', data: m }));
      }

      // 5. Default Response
      else {
        replyText = `I'm not sure I fully understood. I can search databases, filter by skills, or calculate eligibility checks.
        
Try typing:
- *"Show me coding contests this week"*
- *"Suggest hackathons on Unstop"*
- *"What scholarships can SC students get?"*`;
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sender: 'assistant',
        text: replyText,
        recommendedOpportunities: recs.length > 0 ? recs : undefined
      };

      setMessages(prev => [...prev, assistantMsg]);
    }, 1000);
  };

  return (
    <div className={styles.chatContainer}>
      {/* Main Chat Area */}
      <div className={`${styles.chatMain} glass-panel`}>
        <div className={styles.chatHeader}>
          <div className={styles.chatAvatar}>🤖</div>
          <div className={styles.chatHeaderInfo}>
            <span className={styles.chatHeaderTitle}>AI Opportunity Assistant</span>
            <span className={styles.chatHeaderStatus}>● Online & Ready</span>
          </div>
        </div>

        {/* Chat Message Logs */}
        <div className={styles.chatMessages}>
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`${styles.chatMsg} ${msg.sender === 'user' ? styles.chatMsgUser : styles.chatMsgAgent}`}
            >
              <div className={styles.chatAvatar}>
                {msg.sender === 'user' ? '👤' : '🤖'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '85%' }}>
                <div 
                  className={`${styles.chatBubble} ${msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleAgent}`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.text}
                </div>

                {/* Recommendations Grid inside chat logs */}
                {msg.recommendedOpportunities && (
                  <div className={styles.chatCardGrid}>
                    {msg.recommendedOpportunities.map((rec, idx) => {
                      const isHack = rec.type === 'hackathon';
                      const isIntern = rec.type === 'internship';
                      const isScholar = rec.type === 'scholarship';
                      const isContest = rec.type === 'contest';
                      
                      const title = isHack ? rec.data.title : isIntern ? `${rec.data.company} - ${rec.data.role}` : isScholar ? rec.data.name : rec.data.title;
                      const subtitle = isHack ? rec.data.host : isIntern ? rec.data.stipend : isScholar ? rec.data.provider : rec.data.contestPlatform;
                      const tagText = isHack ? rec.data.mode : isIntern ? rec.data.location : isScholar ? rec.data.amount : `${rec.data.date} @ ${rec.data.time}`;
                      
                      return (
                        <div 
                          key={idx} 
                          className="glass-panel" 
                          style={{ 
                            padding: '0.75rem 1rem', 
                            fontSize: '0.8rem', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderLeft: `3px solid ${
                              isHack ? 'var(--primary)' : isIntern ? 'var(--info)' : isScholar ? 'var(--success)' : '#a855f7'
                            }`,
                            borderRadius: '6px'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '600', color: 'white' }}>{title}</div>
                            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                              {subtitle} • <span style={{ color: 'white', fontWeight: '500' }}>{tagText}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => onNavigateTab(isHack ? 'hackathons' : isIntern ? 'internships' : isScholar ? 'scholarships' : 'contests')}
                            style={{ 
                              background: 'rgba(255,255,255,0.05)', 
                              border: '1px solid rgba(255,255,255,0.1)', 
                              padding: '0.35rem 0.65rem', 
                              borderRadius: '6px', 
                              fontSize: '0.75rem', 
                              color: 'white',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            View
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className={styles.chatInputArea}>
          <input 
            type="text" 
            placeholder="Ask AI about contests, scholarships, skills, or internships..."
            className={styles.chatInput}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputMsg);
            }}
          />
          <button 
            className={styles.chatSendBtn}
            onClick={() => handleSendMessage(inputMsg)}
          >
            ➔
          </button>
        </div>
      </div>

      {/* Sidebar Suggestions */}
      <div className={styles.chatSidebar}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          Suggested Inquiries
        </div>
        <div className={styles.promptList}>
          {quickPrompts.map((qp, idx) => (
            <button 
              key={idx} 
              className={styles.promptBtn}
              onClick={() => handleSendMessage(qp.text)}
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
