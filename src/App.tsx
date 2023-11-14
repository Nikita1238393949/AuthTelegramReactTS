import React from 'react';
import { Routes, Route } from 'react-router';
import LoginForm from './LoginForm';
import ClientArea from './clientarea';

const App: React.FC = () => {
    return (
            <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/clientarea" element={<ClientArea />} />
            </Routes>
    );
};

export default App;