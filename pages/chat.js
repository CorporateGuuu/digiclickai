import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState('general');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/chat');
    }
  }, [status, router]);

  // Fetch channels
  useEffect(() => {
    async function fetchChannels() {
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        if (data) {
          setChannels(data);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        // Use mock data if there's an error
        setChannels([
          { id: 1, name: 'general', description: 'General discussion' },
          { id: 2, name: 'support', description: 'Customer support' },
          { id: 3, name: 'orders', description: 'Order inquiries' }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, []);

  // Fetch messages for the current channel
  useEffect(() => {
    async function fetchMessages() {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*, profiles(*)')
          .eq('channel', currentChannel)
          .order('created_at');
        
        if (error) throw error;
        
        if (data) {
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Use mock data if there's an error
        setMessages([
          { 
            id: 1, 
            content: 'Welcome to the chat!', 
            created_at: new Date().toISOString(),
            profiles: { 
              username: 'System', 
              avatar_url: '/images/avatars/system.png' 
            } 
          },
          { 
            id: 2, 
            content: 'How can we help you today?', 
            created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            profiles: { 
              username: 'Support', 
              avatar_url: '/images/avatars/support.png' 
            } 
          }
        ]);
      }
    }

    if (currentChannel) {
      fetchMessages();
    }
  }, [currentChannel]);

  // Subscribe to new messages
  useEffect(() => {
    const subscription = supabase
      .channel(`public:messages:channel=eq.${currentChannel}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel=eq.${currentChannel}`
      }, (payload) => {
        // Fetch the user profile for the new message
        const fetchMessageWithProfile = async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', payload.new.user_id)
              .single();
            
            if (error) throw error;
            
            const newMessageWithProfile = {
              ...payload.new,
              profiles: data
            };
            
            setMessages(prevMessages => [...prevMessages, newMessageWithProfile]);
          } catch (error) {
            console.error('Error fetching profile for new message:', error);
            // Add the message without profile info
            setMessages(prevMessages => [...prevMessages, payload.new]);
          }
        };
        
        fetchMessageWithProfile();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentChannel]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !session?.user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            content: newMessage, 
            channel: currentChannel,
            user_id: session.user.id
          }
        ]);
      
      if (error) throw error;
      
      // Clear input field
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Add message to local state for demo purposes
      const mockMessage = {
        id: Date.now(),
        content: newMessage,
        created_at: new Date().toISOString(),
        profiles: {
          username: session?.user?.name || 'You',
          avatar_url: session?.user?.image || '/images/avatars/default.png'
        }
      };
      setMessages(prevMessages => [...prevMessages, mockMessage]);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (status === 'loading' || loading) {
    return (
      <Layout title="Chat | MDTS">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
            <p className="ml-4">Loading chat...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Layout title="Chat | MDTS">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Please sign in to access the chat.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Chat | MDTS">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">MDTS Support Chat</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Channel Sidebar */}
          <div className="w-full md:w-1/4 bg-gray-100 rounded-lg p-4">
            <h2 className="font-semibold text-lg mb-4">Channels</h2>
            <ul>
              {channels.map((channel) => (
                <li key={channel.id} className="mb-2">
                  <button
                    onClick={() => setCurrentChannel(channel.name)}
                    className={`w-full text-left px-3 py-2 rounded ${
                      currentChannel === channel.name
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    # {channel.name}
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      {channel.description}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Chat Area */}
          <div className="w-full md:w-3/4 bg-white rounded-lg shadow-md flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b">
              <h2 className="font-semibold">#{currentChannel}</h2>
              <p className="text-sm text-gray-500">
                {channels.find(c => c.name === currentChannel)?.description || 'Channel description'}
              </p>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="mb-4 flex">
                    <div className="flex-shrink-0 mr-3">
                      <img
                        src={message.profiles?.avatar_url || '/images/avatars/default.png'}
                        alt={message.profiles?.username || 'User'}
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline">
                        <span className="font-semibold mr-2">
                          {message.profiles?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-800">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ChatPage;
