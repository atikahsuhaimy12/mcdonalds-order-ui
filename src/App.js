// COPY ALL OF THIS CODE INTO YOUR App.js FILE

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Users, User } from 'lucide-react';

const OrderManagementSystem = () => {
  const [orders, setOrders] = useState([]);
  const [bots, setBots] = useState([]);
  const [orderCounter, setOrderCounter] = useState(1);
  const [botCounter, setBotCounter] = useState(1);
  const processingTimeouts = useRef({});

  const addOrder = (isVIP) => {
    const newOrder = {
      id: orderCounter,
      type: isVIP ? 'VIP' : 'NORMAL',
      status: 'PENDING',
      createdAt: new Date().toLocaleTimeString()
    };

    setOrders(prevOrders => {
      const pending = prevOrders.filter(o => o.status === 'PENDING');
      const completed = prevOrders.filter(o => o.status === 'COMPLETE');
      
      if (isVIP) {
        const vipOrders = pending.filter(o => o.type === 'VIP');
        const normalOrders = pending.filter(o => o.type === 'NORMAL');
        return [...vipOrders, newOrder, ...normalOrders, ...completed];
      } else {
        return [...pending, newOrder, ...completed];
      }
    });

    setOrderCounter(prev => prev + 1);
  };

  const addBot = () => {
    const newBot = {
      id: botCounter,
      status: 'IDLE',
      processingOrderId: null
    };
    setBots(prev => [...prev, newBot]);
    setBotCounter(prev => prev + 1);
  };

  const removeBot = () => {
    if (bots.length === 0) return;

    const lastBot = bots[bots.length - 1];
    
    if (lastBot.processingOrderId !== null) {
      clearTimeout(processingTimeouts.current[lastBot.id]);
      delete processingTimeouts.current[lastBot.id];
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === lastBot.processingOrderId 
            ? { ...order, status: 'PENDING' }
            : order
        )
      );
    }

    setBots(prev => prev.slice(0, -1));
  };

  const processOrder = (botId, orderId) => {
    setBots(prevBots =>
      prevBots.map(bot =>
        bot.id === botId
          ? { ...bot, status: 'PROCESSING', processingOrderId: orderId }
          : bot
      )
    );

    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? { ...order, status: 'PROCESSING' }
          : order
      )
    );

    processingTimeouts.current[botId] = setTimeout(() => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: 'COMPLETE', completedAt: new Date().toLocaleTimeString() }
            : order
        )
      );

      setBots(prevBots =>
        prevBots.map(bot =>
          bot.id === botId
            ? { ...bot, status: 'IDLE', processingOrderId: null }
            : bot
        )
      );

      delete processingTimeouts.current[botId];
    }, 10000);
  };

  useEffect(() => {
    const idleBots = bots.filter(bot => bot.status === 'IDLE');
    const pendingOrders = orders.filter(order => order.status === 'PENDING');

    idleBots.forEach((bot, index) => {
      if (pendingOrders[index]) {
        processOrder(bot.id, pendingOrders[index].id);
      }
    });
  }, [bots, orders]);

  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING');
  const completedOrders = orders.filter(o => o.status === 'COMPLETE');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-red-600 mb-6 flex items-center gap-2">
            🍔 McDonald's Order Management System
          </h1>

          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => addOrder(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <User size={20} />
              New Normal Order
            </button>
            <button
              onClick={() => addOrder(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Users size={20} />
              New VIP Order
            </button>
            <button
              onClick={addBot}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Plus size={20} />
              Bot
            </button>
            <button
              onClick={removeBot}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              disabled={bots.length === 0}
            >
              <Minus size={20} />
              Bot
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Active Bots: {bots.length}</h3>
            <div className="flex flex-wrap gap-2">
              {bots.map(bot => (
                <div
                  key={bot.id}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    bot.status === 'PROCESSING'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-green-200 text-green-800'
                  }`}
                >
                  Bot #{bot.id} - {bot.status}
                  {bot.processingOrderId && ` (Order #${bot.processingOrderId})`}
                </div>
              ))}
              {bots.length === 0 && (
                <p className="text-gray-500 italic">No bots available</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">
              PENDING ({pendingOrders.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingOrders.map(order => (
                <div
                  key={order.id}
                  className={`p-4 rounded-lg border-2 ${
                    order.type === 'VIP'
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-blue-50 border-blue-300'
                  } ${
                    order.status === 'PROCESSING' ? 'animate-pulse' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg">Order #{order.id}</span>
                      <span className={`ml-3 px-2 py-1 rounded text-sm font-semibold ${
                        order.type === 'VIP'
                          ? 'bg-purple-200 text-purple-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}>
                        {order.type}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'PROCESSING'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Created: {order.createdAt}</p>
                </div>
              ))}
              {pendingOrders.length === 0 && (
                <p className="text-gray-400 italic text-center py-8">No pending orders</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              COMPLETE ({completedOrders.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {completedOrders.map(order => (
                <div
                  key={order.id}
                  className="p-4 rounded-lg bg-green-50 border-2 border-green-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg">Order #{order.id}</span>
                      <span className={`ml-3 px-2 py-1 rounded text-sm font-semibold ${
                        order.type === 'VIP'
                          ? 'bg-purple-200 text-purple-800'
                          : 'bg-blue-200 text-blue-800'
                      }`}>
                        {order.type}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800">
                      COMPLETE
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Created: {order.createdAt} | Completed: {order.completedAt}
                  </p>
                </div>
              ))}
              {completedOrders.length === 0 && (
                <p className="text-gray-400 italic text-center py-8">No completed orders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagementSystem;